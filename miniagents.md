# miniagents.md — Regras dos mini agents (OpenCode)

> Objetivo: executar tarefas pequenas e bem definidas com modelo barato, sem inflar o contexto do líder.
> Leia antes: `docs/STATE.md` e o `STATE-<área>.md` da área. Spec no formato `docs/specs/TEMPLATE.md`.
> Itens marcados (confirmar) dependem da versão do OpenCode/Orca instalada: conferir com `--help` ou na doc.

## 1. Quando criar um mini (e quando NÃO)
Criar só se TODAS forem verdade:
- A tarefa é independente e cabe numa spec de até ~25 linhas.
- Os arquivos que ela toca estão listados e não conflitam com outro agente.
- O resultado é verificável por um comando (lint, tipos, teste).
- O custo de partida (ler STATE + arquivos) é menor que fazer a tarefa direto.

Não criar mini para: rodar lint/teste/build (usar script), tarefa de 1 a 2 linhas, decisão de arquitetura, mexer em segurança/chaves/integração Pierre, tarefa que depende do resultado de outra em andamento.

## 2. Hierarquia
- Líder (agente primário no OpenCode): lê STATE, escreve a spec, delega, recebe relatório curto, atualiza STATE. Não executa o que um mini pode executar e não supervisiona comandos.
- Minis (subagentes, sessão filha com contexto novo): executam uma spec, validam, devolvem 5 linhas e terminam.
- Máx. 2 minis simultâneos no piloto. Nenhum mini cria outros minis.

## 3. Como criar um mini
Um arquivo por tipo, em `.opencode/agents/<nome>.md` (por projeto) ou `~/.config/opencode/agents/` (global). O nome do arquivo é o nome do agente.

```markdown
---
description: <uma linha: o que este mini faz e quando o líder deve chamá-lo>
mode: subagent
model: <provider/model-id>
# limite de passos e permissões (confirmar nomes na doc da versão):
# steps: 15
# permission: edit/bash restritos à área do mini
---
Você é um executor temporário da área <UI|Backend|QA> do Prospect CRM.
1. Leia docs/STATE.md e docs/STATE-<área>.md. Só leia outros arquivos se a spec citar.
2. Faça somente o que a spec pede, apenas nos arquivos permitidos.
3. Valide com o comando da spec.
4. Responda em no máx. 5 linhas: Tarefa | Status | Arquivos alterados | Testes | Bloqueios.
Nunca: commit, push, merge, instalar dependências, mexer em .env*, expor chaves.
Se faltar informação, pare e peça; não adivinhe.
```

Minis sugeridos para o piloto: `mini-qa` (escreve testes, investiga falha) e `mini-ui` (ajustes visuais pequenos).

## 4. Escolha de modelo (preencher com `opencode models`)
| Papel | Modelo | Raciocínio |
|---|---|---|
| Líder / especificador | (médio) ______ | baixo |
| mini-qa, mini-ui | (mais leve disponível) ______ | baixo/nenhum |
| Backend difícil, arquitetura | (forte) ______ | chamado só por decisão humana |
Regra: começar pelo modelo mais leve; subir só se a mesma tarefa falhar 2 vezes por capacidade, não por spec ruim.

## 5. Spec (o que o líder envia)
Usar `docs/specs/TEMPLATE.md`: Objetivo | Contexto mínimo | Arquivos permitidos | Fora de escopo | Comportamento esperado | Critérios de aceite | Como validar | Formato do relatório. Spec vaga é a causa nº 1 de retrabalho: se não der pra escrever o critério de aceite, a tarefa não está pronta para delegar.

## 6. Ciclo de vida
1. Líder lê STATE e escreve a spec.
2. Chama o mini (menção `@nome` ou delegação pelo agente primário; confirmar).
3. Mini executa, valida e responde em 5 linhas.
4. Líder confere só o relatório e `git diff --stat`. Se reprovar, 1 correção com instrução objetiva; na segunda falha, o líder assume ou escala o modelo.
5. Líder atualiza 3 a 5 linhas do STATE. A sessão do mini é descartada (o histórico não volta pro líder).
Relatórios completos ficam em arquivo (ex.: `docs/reports/`), nunca colados na conversa do líder.

## 7. Isolamento
- Tarefas de escrita em paralelo: um worktree por mini, ou pastas sem sobreposição.
- Não criar worktree novo para tarefa pequena; reutilizar o do agente da área.
- Cada worktree precisa de `npm install` próprio para lint/testes funcionarem.

## 8. O que o Orca precisa (e o que não precisa)
- Para subagentes nativos do OpenCode: nada. O Orca só hospeda o terminal do OpenCode; os minis nascem dentro dele.
- Para o líder abrir worktrees/terminais pelo Orca: skill `orca-cli` e o CLI do Orca (confirmar o que ele cria: worktree sim; abrir agente em terminal novo, conferir com `orca --help`).
- O Codex NÃO cria subagentes do OpenCode. Se o líder for Codex, ele só dispara o OpenCode por comando (ex.: `opencode run`, confirmar) ou você abre o mini à mão.
- Plugin/MCP: não são necessários para este fluxo.

## 9. Segurança e limites
- Mini nunca faz commit/push/merge, nunca toca `.env*`, nunca lê nem escreve chave (`PIERRE_API_KEY` etc.).
- Mini não instala dependências nem altera config do Orca/OpenCode.
- Limite de passos por mini; se estourar, para e reporta.
- Plano do OpenCode tem cota própria: monitorar antes e depois de cada teste.

## 10. Medição do piloto (anotar por tarefa)
Cota antes/depois (líder e minis) | tokens/contexto do líder no fim | tentativas até aprovar | retrabalho do líder | qualidade (ok/parcial/ruim).
Critério de sucesso: líder com contexto pequeno + minis aprovados em até 1 correção. Se o líder refaz o trabalho do mini, o mini não compensa naquela tarefa.
