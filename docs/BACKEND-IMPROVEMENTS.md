# Revisão e melhorias recomendadas — Backend CRM

Documento de handoff para implementação pelo responsável do backend. É uma análise, não uma autorização para alterar produção. Os níveis indicam impacto provável; achados sem acesso ao provedor real estão marcados como risco a confirmar.

## Prioridade mais alta

### Médio — proteger o endpoint de login contra tentativas automatizadas

`src/app/api/auth/login/route.ts` verifica uma senha compartilhada sem limitação de tentativas visível no código. Um endpoint público sem throttling facilita força bruta e tentativa de credenciais.

**Recomendação:** aplicar limite por IP e janela de tempo com armazenamento compartilhado entre instâncias; considerar atraso progressivo e monitorar picos. Evitar bloqueio permanente por conta/IP, que pode virar negação de serviço. Manter mensagens de falha genéricas e nunca registrar a senha.

**Validar:** teste de limite com credenciais sintéticas, comportamento distribuído entre instâncias e ausência de segredo em resposta/log.

### Médio — não devolver mensagens internas de exceção ao cliente

`src/lib/api.ts:9-12` envia `error.message` diretamente na resposta HTTP. Erros de banco ou provedor podem expor detalhes operacionais; as rotas Gemini também retornam mensagens externas diretamente em alguns caminhos.

**Recomendação:** responder com mensagem pública estável e identificador de correlação; registrar detalhes apenas no servidor, com redação de tokens, URLs com credenciais, payloads e dados pessoais. Preservar códigos HTTP apropriados sem copiar mensagens brutas do provedor.

**Validar:** simular erro Oracle/Supabase/Gemini e confirmar que detalhes aparecem somente em logs protegidos e redigidos.

## Problemas de contrato e consistência

### Médio — normalizar datas ao formato persistido pelo Oracle

`src/app/api/leads/route.ts` aceita qualquer string reconhecida por `Date.parse`. Em `src/lib/db.ts:106-121`, Oracle converte com um formato ISO mais específico e `DEFAULT NULL ON CONVERSION ERROR`; a resposta é montada do objeto `next`, sem reler o valor persistido. Formatos aceitos pela API podem, portanto, ser gravados como `NULL` e ainda aparecer como sucesso na resposta. O teste atual usa o provider demo e não cobre a conversão Oracle.

**Recomendação:** definir um único contrato (por exemplo, timestamp ISO 8601 com timezone), validar forma e calendário antes do banco, converter explicitamente e tratar falha de conversão como erro; retornar o valor efetivamente persistido. Não converter silenciosamente para `NULL` quando o usuário enviou uma data.

**Validar:** testes de contrato para ISO com timezone, data sem timezone, data impossível, `null` e persistência/read-back em Oracle de teste.

### Médio — manter atualização do lead e evento na mesma transação

Em `src/lib/db.ts:105-119`, a atualização do lead usa `autoCommit: true`; a inclusão de `STATUS_CHANGED` é uma segunda operação também com autocommit. Se a segunda falhar, o endpoint pode responder erro embora o status já tenha sido alterado, sem evento correspondente.

**Recomendação:** executar ambas as operações na mesma transação e confirmar uma única vez; em qualquer erro, fazer rollback. Retornar sucesso apenas após commit.

**Validar:** injetar falha no insert de evento e confirmar que nem o status nem o evento ficam parcialmente gravados.

### Baixo — JSON malformado deve ser erro 400, não erro 500

Foi reproduzido em `/api/sites/generate`, `/api/ai/message` e `/api/import/apify`: JSON inválido chega ao `apiError` e vira 500 com texto do parser. O mesmo padrão existe nos handlers que chamam `request.json()` dentro de `try`.

**Recomendação:** tratar erro de parsing como entrada inválida (400), mantendo 500 para falhas internas. Aplicar resposta consistente a todas as rotas que recebem JSON.

**Validar:** enviar JSON truncado e corpo vazio para cada método protegido e conferir 400, sem stack/parser exposto.

## Segurança e limites de integração

### Médio — definir timeout e limite de resposta para chamadas externas

`src/app/api/ai/message/route.ts`, `src/app/api/import/apify/route.ts` e `src/lib/db.ts` usam `fetch` sem timeout explícito. A geração de site já tem timeout em `src/app/api/sites/generate/route.ts:64-72`, mas tenta até dois modelos, podendo consumir duas janelas. Uma dependência lenta pode prender requisições e ocupar capacidade.

**Recomendação:** usar timeout/cancelamento coerente com o limite de execução do deploy, uma política clara de retry apenas para falhas transitórias e limites de bytes/itens antes de parsear respostas. Não repetir operações que possam gravar dados sem idempotência.

**Validar:** simular timeout, 429/5xx, resposta grande e JSON inválido; confirmar tempo máximo, resposta pública estável e preservação dos dados anteriores.

### Médio — reduzir exposição do token Apify

`src/app/api/import/apify/route.ts:20-22` coloca `APIFY_TOKEN` na query string da URL externa. Embora o token não seja enviado ao navegador, URLs podem ser capturadas por logs de rede/diagnóstico.

**Recomendação:** verificar o contrato oficial vigente do Apify e, se suportado, enviar credencial por header de autorização. Garantir redação de URL e credenciais em logs.

**Validar:** inspecionar logs do runtime e tráfego de teste; confirmar que nenhum token aparece em URL registrada, resposta ou telemetria.

### Médio — limitar e validar payloads antes de chamar Gemini

`src/app/api/ai/message/route.ts:12-24` aceita um objeto `lead` completo enviado pelo cliente e o inclui no prompt. A sessão protege a rota, mas o backend ainda deve tratar todo payload como não confiável; campos longos ou inventados podem aumentar custo e alterar o conteúdo enviado ao provedor.

**Recomendação:** preferir receber `leadId` e obter os campos necessários do banco; validar campos/tamanhos, minimizar dados enviados ao Gemini e aplicar limite de uso por sessão. Não enviar contatos ou notas se não forem necessários para gerar a mensagem.

**Validar:** payloads com tipos errados, campos enormes e conteúdo de prompt injection; verificar que só campos permitidos e limitados são enviados.

## Desempenho e capacidade

### Médio — paginar a listagem de leads

`src/lib/db.ts:83-93` lê todos os leads do Oracle sem limite; a interface baixa a coleção toda e filtra no navegador. O custo de memória, rede e consulta cresce junto com a base.

**Recomendação:** definir paginação estável (cursor recomendado), limite máximo por página e filtros no backend. Confirmar índice apropriado com plano de execução antes de criar/alterar índices. Manter contagens agregadas no servidor se a base justificar.

**Validar:** medir latência e payload com volume sintético representativo, páginas sem duplicação/perda durante atualizações e plano da consulta no Oracle.

### Baixo — tornar importação Oracle eficiente sem perder atomicidade

`src/lib/db.ts:140-154` executa um `MERGE` por lead em série, até 1000 itens, e faz commit ao final. Isso mantém o lote atômico, mas pode alongar a chamada.

**Recomendação:** medir primeiro; se for gargalo, usar operação em lote (`executeMany` ou mecanismo equivalente) em blocos limitados, preservando idempotência e uma política explícita de transação/rollback.

**Validar:** comparar duração em volumes típicos e máximos, repetição do mesmo dataset, falha no meio do lote e rollback.

### Baixo — evitar operações repetidas de banco na mudança de status

`updateLead` faz `SELECT` antes do `UPDATE` para compor a resposta e detectar mudança de status. É necessário manter a semântica atual, mas sob concorrência duas atualizações podem ler o mesmo estado anterior e produzir eventos incorretos.

**Recomendação:** após instrumentar, avaliar `UPDATE ... RETURNING`/bloqueio adequado ou outra abordagem transacional que preserve eventos corretos. Não otimizar sem teste concorrente e suporte confirmado da versão Oracle usada.

## Proteções já presentes

- Sessão assinada com HMAC e comparação de assinatura com `timingSafeEqual` em `src/lib/auth.ts`.
- Cookie de sessão `HttpOnly`, `SameSite=Strict` e `Secure` em produção.
- Segredos são lidos do servidor; não foi encontrado uso de `NEXT_PUBLIC_*` nas rotas/lib revisadas.
- Rotas de negócio verificam autenticação antes de executar trabalho protegido.
- `PATCH /api/leads` tem validação de enum e datas adicionada no worktree e teste HTTP com dados sintéticos; manter esses contratos e ampliar cobertura Oracle.
- Geração de site tem timeout, resposta anterior preservada em indisponibilidade e filtragem de conteúdo; testes do template cobrem escape e URLs executáveis.
- Não há envio automático de mensagens de contato: a interface abre canal para revisão/envio manual.

## Validação já executada

No checkout atual, com dados e credenciais sintéticas:

- `node --experimental-strip-types --test tests/auth.test.mjs` — passou (1 teste).
- `node --test tests/leads.test.mjs` — passou (1 teste; provider demo).
- `npm run test:template` — passou (5 testes).
- `npm run lint` — passou.
- `npm run build` — passou.
- `npm test` — passou: 9 testes, 1 ignorado por ser exclusivo do projeto mobile no projeto desktop.
- Testes contra Oracle/Supabase/Apify/Gemini reais não foram executados; recomendações de integração devem ser verificadas em ambiente isolado.

## Ordem sugerida para implementação

1. Rate limit no login e respostas de erro sem detalhes internos.
2. Contrato de data Oracle e transação de atualização/evento.
3. Respostas 400 para JSON inválido e limites/timeout de integrações externas.
4. Validação/minimização do payload Gemini e proteção do token Apify.
5. Medição de listagem/importação; implementar paginação e lote conforme os resultados.

Ao concluir cada item, adicionar teste de regressão no escopo correspondente e atualizar este handoff com o resultado. Não avançar integração com outros provedores sem contrato técnico aprovado e credenciais de teste isoladas.
