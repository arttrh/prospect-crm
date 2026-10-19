# Prospect CRM — Estado

## 1. Arquitetura

- Stack: Next.js 16, React 19, TypeScript 5, Radix UI, dnd-kit, Lucide, OracleDB e Playwright.
- `src/app/`: App Router, páginas, estilos e rotas HTTP.
- `src/components/`: componentes do CRM; principal: `crm-app.tsx`.
- `src/lib/`: domínio, autenticação, banco e integrações server-only.
- `oracle/`: schema Oracle; Supabase é ponte temporária; sem banco, usar dados demonstrativos.
- `scripts/` e `vendor/diego-astro/`: build do template de sites dos leads.
- `referencias/` e `.opencode/reference-assets/`: briefing visual e capturas Pierre.
- Documento Pencil ativo: `/home/arttrh/.pencil/documents/4aef1fc5-de8c-4b76-bd05-539f0e3fbfd7/untitled.pen`.
- Controller: define escopo, delega, aplica gates e consolida relatórios.
- `paper-design-desktop`: executa e revisa frames desktop no Pencil; não subdelega.
- `paper-design-mobile`: executa e revisa frames mobile no Pencil; não subdelega.
- `paper-qa-desktop` e `paper-qa-mobile`: auditoria visual sem editar o canvas; perfis ainda orientados ao Paper.
- Worktrees conhecidos: `Agents-controller`, `Ui-CRM`, `Back-end-CRM`, `QA-CRM`, `QA-Gemini-Commit` e `QA-Deepseek-Test-Commits`.
- UI cuida de proposta e frontend; Backend cuida de API/auth/dados; QA valida regressões desktop/mobile.

## 2. Estado atual

### Feito

- CRM existente: login, leads, Kanban de oito estágios, lista, filtros, importação Apify, contatos manuais e geração de sites/mensagens.
- Referências Pierre commitadas em `.opencode/reference-assets/`.
- Pencil conectado e documento ativo confirmado.
- Oito frames Pierre CRM criados: Visão geral, Relatórios, Follow-ups e Integração, em desktop e mobile.
- Identidade atual: fundo preto, cards grafite, texto branco e acentos roxo/lilás; vermelho somente para erro/atraso.
- Relatórios usam composição inspirada na captura `Captura-2026-10-18_22-49-23-Bo2aJx.png`, adaptada para CRM.
- Follow-ups incluem hoje, atrasados, próximos contatos, prioridade, canal e ações manuais.
- Integração Pierre tem estados conceituais e CTA `Abrir app Pierre`; oito previews foram revisados sem recortes reportados.

### Em andamento

- Implementação visual aprovada concluída em `src/components/crm-app.tsx` e `src/app/globals.css`.
- QA visual/regressão revisou desktop/mobile; falta validação executável quando as dependências estiverem disponíveis.

### Bloqueado

- Integração Pierre real aguarda contrato: endpoints, autenticação, escopos, URL oficial, sandbox/produção e webhooks.
- `PIERRE_API_KEY` deve permanecer server-only; nunca usar `NEXT_PUBLIC_*`, frontend, URL, logs, chat, Pencil ou Git.
- O CTA `Abrir app Pierre` é conceitual até a URL oficial ser fornecida.
- Logo Pierre no Pencil é vetor aproximado; o asset local não pôde ser importado diretamente.
- `scripts/agent-brief.mjs`, lint, TypeScript, Playwright e Next.js build permanecem bloqueados por ausência de CLIs/dependências neste checkout.

## 3. Próximos passos

1. Usuário confirmar que os oito frames atuais são a direção final para implementação.
2. Escrever spec curta por fluxo: navegação/base visual, Relatórios, Follow-ups e Integração Pierre.
3. Implementar primeiro a base responsiva e navegação, sem contrato Pierre inventado.
4. Implementar Relatórios com `Dados demonstrativos` quando não houver histórico real.
5. Implementar Follow-ups mantendo contatos manuais, revisáveis e acessíveis.
6. Implementar somente a casca visual da integração Pierre até o contrato ser aprovado.
7. Rodar lint, tipos, Playwright desktop/mobile e build.
8. QA validar o último estado; corrigir apenas regressões confirmadas.
9. Pedir autorização antes de commit, push, PR ou merge.

## 4. Armadilhas já encontradas

- O Paper atingiu limite de cota; não alegar disponibilidade sem leitura MCP atual.
- Pencil não importou os assets locais; a logo Pierre ficou aproximada.
- Subagentes não podem ser executados como agentes primários; o líder deve delegar via Task.
- Dois agentes editando o mesmo `.pen` podem conflitar; executar desktop e mobile sequencialmente.
- Oito colunas comprimidas quebram o mobile; usar acesso ao funil completo sem colunas estreitas.
- GMB e navegação inferior não podem cobrir conteúdo; alvos de toque devem ter pelo menos 44 px.
- Cards brancos quebraram a identidade escura; padrão aprovado é grafite com seleção roxa discreta.
- Gráficos sem histórico real devem exibir `Dados demonstrativos`.
- Screenshot de protótipo estático não comprova interação, link ou integração funcional.
- Não copiar marca, textos ou dados financeiros Pierre para conteúdo do CRM.
- Alterações existentes fora do escopo pertencem ao usuário; não descartar nem sobrescrever.
- Next.js 16 tem mudanças incompatíveis; ler `node_modules/next/dist/docs/` antes de alterar APIs ou convenções.

## 5. Protocolo do Controller

- Não ler arquivos grandes nem logs completos; pedir resumo ao executor.
- Delegar com spec curta usando `docs/specs/TEMPLATE.md`.
- Não supervisionar comandos; intervir somente em erro ou bloqueio.
- Relatórios de volta têm no máximo 5 linhas; detalhes ficam em arquivo.
- Transformar lint, tipos, testes e build repetitivos em scripts; não reescrever comandos.
- Ao concluir cada tarefa, atualizar de 3 a 5 linhas deste arquivo.
- Se o contexto passar de aproximadamente 60%, atualizar este arquivo, avisar o usuário e parar para nova sessão.
- Usar raciocínio baixo por padrão; subir somente com justificativa curta.
- Não criar agentes duplicados; reutilizar perfis e worktrees existentes.
- Não fazer commit, push, PR, merge ou contato externo sem autorização explícita.
- Preservar cliente, modelo e autenticação da sessão; subagentes não subdelegam.
- Relatar escopo, validação, riscos e bloqueios sem narrativa extensa.
