# STATE-ui.md — UI-CRM

> Escopo: frontend, componentes, responsividade e experiência visual.
> Leia antes: `docs/STATE.md` (global, ainda ausente neste worktree) e este arquivo.
> Limite: ~60 linhas, sem logs; só o líder de UI atualiza 3–5 linhas ao concluir cada tarefa.

## Escopo e limites
- Pode mexer: `src/app/**` (páginas/layouts), `src/components/**` e estilos relacionados.
- Não mexer sem pedido explícito: `src/lib/**`, `src/app/api/**`, `supabase/**`, `scripts/**`, `.env*` e `AGENTS.md`.
- Nunca fazer automaticamente: commit, push, merge, Paper, WhatsApp ou contato externo.
- Antes de implementar UI relevante: proposta no Paper, evidência MCP de leitura, aprovação e só então código.

## Stack e convenções
- Next.js 16 App Router, React 19 e TypeScript 5.
- Radix UI Themes/Dialog/Select/Tabs; `@dnd-kit/core`; ícones `lucide-react`.
- CSS global em `src/app/globals.css`, com variáveis em `:root`, classes kebab-case e breakpoints em 1050/680 px.
- Componente principal: `src/components/crm-app.tsx`; testes de tela: Playwright.
- O Kanban possui oito estágios; preservar alternativa acessível `Mover status` ao arraste.
- Referências visuais externas devem ser lidas somente quando citadas pela tarefa.

## Segurança obrigatória
- `PIERRE_API_KEY` somente em `.env.local`/Vercel; nunca no frontend, URL, logs, chat ou `.env.example`.
- Nunca criar `NEXT_PUBLIC_PIERRE_API_KEY`; a UI consome somente rotas internas do backend.
- Contatos por WhatsApp, e-mail e Instagram permanecem manuais e revisáveis.
- Gráficos sem histórico real devem estar marcados como `Dados demonstrativos`.

## Estado atual
- Feito: briefing visual organizado; protótipos A e B revisados/aprovados visualmente.
- Em andamento: correção e nova validação da proposta C no mobile.
- Bloqueado: telas Pierre aguardam contrato técnico do backend.
- Gate: Paper deve voltar com `get_basic_info` somente leitura antes de novas alterações; sem polling repetitivo.
- Execução local prevista por `npm run dev`; processo ativo não foi confirmado nesta atualização.

## Validação mínima
- Dependências: `npm install` neste worktree; conferir árvore com `npm ls --depth=0`.
- Estática: `npm run lint` e `npx tsc --noEmit`.
- Fluxos: `npm test` ou Playwright focado nas telas alteradas.
- UI: registrar previews/screenshots das telas alteradas em desktop e mobile.
- Build/CI: `npm run build` antes da entrega quando dependências server-only estiverem disponíveis.

## Armadilhas conhecidas
- Oito colunas comprimidas quebram legibilidade; no mobile evitar overflow acidental e alvos menores que 44 px.
- Clonar protótipos sem conferir a árvore pode duplicar rótulos, estágios ou componentes.
- Drag-and-drop sem ação `Mover status` exclui teclado e toque assistivo.
- Paper é protótipo estático: screenshot não comprova interação executável.
- Next.js 16 tem mudanças incompatíveis; ler `node_modules/next/dist/docs/` antes de alterar APIs/convenções.
- `npm run build` executa `scripts/build-diego.mjs`; falhas do template podem preceder o build Next.js.

## Próximos passos
1. Corrigir o layout mobile da entrega C sem perder os oito estágios nem os alvos de toque.
2. Capturar previews desktop/mobile e executar lint, tipos e Playwright focado.
3. Entregar à CI e registrar o resultado do build.
4. Pedir validação ao QA; corrigir somente regressões confirmadas.
5. Preencher as próximas telas na ordem de prioridade aprovada pelo Controller.

## Relatório de volta — máximo 5 linhas
`Tarefa | Status | Arquivos alterados | Testes | Bloqueios`
