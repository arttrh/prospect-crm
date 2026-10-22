# Issue #12 — Backend tests

## Objetivo
Integrar a suíte local de testes backend que centraliza o ciclo de vida do servidor Next e cobre os contratos de autenticação e leads.

## Contexto mínimo
`docs/STATE.md`, `package.json`, `tests/helpers/next-test-server.mjs`, `tests/fixtures/test-server.mjs`, `tests/next-test-server.test.mjs`, `tests/login.test.mjs` e `tests/leads.test.mjs`.

## Arquivos permitidos
`package.json`, `tests/helpers/next-test-server.mjs`, `tests/fixtures/test-server.mjs`, `tests/next-test-server.test.mjs`, `tests/login.test.mjs`, `tests/leads.test.mjs`, `docs/STATE.md` e esta spec.

## Ownership
Backend é responsável pelos contratos exercitados; Controller é responsável pelo gate e pelos documentos. Os arquivos `package.json` e `tests/**` têm ownership compartilhado explícito Backend/QA para esta Issue. `node scripts/agent-brief.mjs` classificou o conjunto como `shared`, `backend` e `controller`, com `crossArea: true`.

## Graphify
- Repositório: `arttrh/prospect-crm`
- Commit indexado: `67b129084f4f75ab895c6c2e24c0173b1f72d02f`.
- Operação: `query_graph` — “How are backend HTTP integration tests for authentication and leads implemented, and which files or helpers start a Next server for those tests?”.
- Confirmação local: o índice mostrou `tests/login.test.mjs` e `tests/leads.test.mjs` com inicialização duplicada de Next; o código vivo e `git diff` confirmam que ambos agora usam `tests/helpers/next-test-server.mjs`, que os testes de ciclo de vida são locais e que nenhuma rota de produção foi alterada.

## Fora de escopo
Rotas de produção, UI, dados de demo, segredos, dependências, rede externa, template, commit, push, PR e merge.

## Comportamento esperado
`npm run test:backend` executa os testes de backend sequencialmente e cada teste que inicia Next encerra apenas o processo que criou.

## Critérios de aceite
- O helper cobre readiness, timeout, parada idempotente e porta ocupada sem sinalizar processo externo.
- Login e leads reutilizam o helper, e os contratos de sessão, logout e PATCH permanecem cobertos.
- O gate de integração permite a revisão do diff; qualquer commit depende de decisão explícita do Controller após essa revisão.

## Como validar
`npm run test:backend && npm run lint && npx tsc --noEmit && git diff --check`

## Checkpoint
Em interrupção, gravar `docs/checkpoints/issue-12-backend-tests.md` com o template, sem segredos ou logs completos.

## Formato do relatório
Máximo 5 linhas: `Status | Arquivos alterados | Testes | Bloqueios | Observações`.
