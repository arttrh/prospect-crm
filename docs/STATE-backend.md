# STATE — Back-end CRM

> Escopo: APIs, dados, autenticação e integrações server-only. Leia também `docs/STATE.md` quando existir.

## Estado atual

- Branch: `arttrh/Back-end-CRM`; autenticação corrigida no commit `9c43b92`.
- Login retorna `503` quando `SESSION_SECRET` não chega ao runtime; não emite cookie inválido.
- Após senha válida, a interface mostra falha de sessão/carga em vez de voltar silenciosamente ao formulário.
- Segredos continuam server-only: `CRM_ACCESS_PASSWORD` e `SESSION_SECRET`; nunca usar `NEXT_PUBLIC_`.

## Validação recente

- Passaram: `node --experimental-strip-types --test tests/auth.test.mjs`, `tsc --noEmit`, ESLint e `git diff --check`.
- Produção pública: página `200`; sessão sem cookie e senha inválida retornam `401` como esperado.
- Playwright E2E não foi concluído: a porta `3000` estava ocupada por outro worktree; repetir em porta isolada antes do deploy.

## Issues e bugs abertos

- Issue #1: `PATCH /api/leads` ignora valores inválidos de `status` e aceita canais/datas sem validação de runtime; deve retornar `400` e ter testes de contrato.
- Login em produção ainda requer confirmação após novo deploy: `CRM_ACCESS_PASSWORD` e `SESSION_SECRET` precisam existir no escopo Production da mesma implantação.
- `docs/STATE.md` e `scripts/agent-brief.mjs` não existem neste worktree; fluxo de handoff está incompleto.

## Dependências e riscos

- Banco Oracle/Supabase pode falhar após autenticação e hoje aparece como erro genérico na interface; investigar logs autorizados se persistir.
- Integrações Pierre, WhatsApp e Apify não devem avançar sem contrato técnico, consentimento e variáveis server-only configuradas.
- Qualquer ajuste visual adicional do login deve ser coordenado com Ui-CRM; a regressão precisa de execução do QA-CRM em ambiente isolado.

## Próximos passos

1. Fazer deploy do commit `9c43b92` e testar login sem expor senha/segredos.
2. Resolver Issue #1 com validação de schema e testes HTTP para `PATCH /api/leads`.
3. Executar Playwright em porta isolada e registrar evidência do QA.
