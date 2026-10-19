# Spec de executor
## Objetivo
Implementar a direção visual aprovada do CRM em desktop/mobile, cobrindo base, Visão geral, Relatórios, Follow-ups e a casca visual Pierre.

## Contexto mínimo
`docs/STATE.md`, `.state.md/STATE-ui.md`, `src/components/crm-app.tsx`, `src/app/globals.css`, `.opencode/reference-assets/`.

## Arquivos permitidos
`src/components/crm-app.tsx`, `src/app/globals.css`, `docs/STATE.md`, `.state.md/STATE-ui.md`.

## Fora de escopo
Backend, banco, autenticação, API, integrações, contratos, URL, webhook, `PIERRE_API_KEY`, `NEXT_PUBLIC_*`, commit e deploy.

## Comportamento esperado
Tema preto/grafite, texto branco, acentos roxo/lilás, navegação consistente, oito estágios do funil, ações acessíveis, relatórios demonstrativos e estados visuais Pierre.

## Critérios de aceite
- Desktop e mobile mantêm contraste, foco visível e alvos de toque de no mínimo 44 px.
- Relatórios exibem KPIs, Barras/Pizza/Tabela e `Dados demonstrativos` sem histórico real.
- Follow-ups exibem hoje, atrasados, próximos, prioridade, canal e ações manuais revisáveis.
- Pierre exibe desconectado, conectando, conectado, erro e sincronizando, sem contrato inventado.

## Como validar
`npm run lint && npx tsc --noEmit && npm test && npm run build`

## Formato do relatório
Máximo 5 linhas: `Status | Arquivos alterados | Testes | Bloqueios | Observações`.
