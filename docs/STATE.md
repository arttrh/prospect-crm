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
- Controller define escopo, specs, gates, ordem de integração e consolida relatórios na worktree `Agents-controller`.
- Recuperação resolve tentativa interrompida ou estado incerto antes de novo despacho na mesma worktree.
- Backend cuida de API, autenticação, dados e integrações server-only em `Back-end-CRM`.
- UI cuida de componentes, páginas, estilos, responsividade e acessibilidade em `Ui-CRM`.
- QA valida independentemente, sem corrigir, em `QA-CRM`, `QA-Gemini-Commit` e `QA-Deepseek-Test-Commits`.
- `paper-design-desktop` e `paper-design-mobile` executam e revisam frames no Pencil, sequencialmente e sem subdelegar; `paper-qa-desktop` e `paper-qa-mobile` auditam sem editar o canvas.
- Worktrees isolam execução; não representam ownership permanente. Mudanças seguem branches curtas e PRs na ordem governança → recuperação → backend → UI → QA, sem inferir que uma etapa foi concluída.

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
- Lint, TypeScript, Playwright e Next.js build dependem das CLIs/dependências do checkout; o classificador local `scripts/agent-brief.mjs` está disponível.

## 3. Próximos passos

1. Integrar e revisar a governança; não promover enquanto ownership, spec, checkpoint e delegação estiverem inconsistentes.
2. Resolver recuperações pendentes e encerrar ou abandonar explicitamente tentativas incertas antes de retry.
3. Integrar Backend somente com contrato server-only e validações da spec.
4. Integrar UI somente após direção visual aprovada, preservando os oito estágios, foco visível e alvos de toque de pelo menos 44 px.
5. Manter Pierre apenas como casca conceitual até aprovação de endpoints, autenticação, escopos, URL, ambientes e webhooks; a chave permanece server-only.
6. Usar Paper/Pencil somente quando a ferramenta estiver disponível e o gate visual estiver aprovado; não tratar protótipo como integração funcional.
7. QA validar o commit integrado com os checks aplicáveis do classificador e registrar evidência local, remota ou bloqueada sem extrapolação.
8. Pedir o gate correspondente antes de commit, push, PR ou merge.

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

- Ler este estado e a spec criada com `docs/specs/TEMPLATE.md`; executar `node scripts/agent-brief.mjs <arquivos permitidos>` antes do despacho.
- Delegar pelo Orca supervisionado com Task/Dispatch, spec curta, arquivos fechados, ownership e aceite observável; preservar cliente, modelo e autenticação.
- Manter um executor autoritativo por worktree e uma tentativa autoritativa por tarefa, sem compartilhar arquivos, servidor ou artefatos entre execuções concorrentes.
- O executor envia perguntas, heartbeat e bloqueios pelo canal da Dispatch e, ao terminar, envia `worker_done` exatamente uma vez com resultado, arquivos e evidências.
- O Controller confere relatório, Git e checks; depois reutiliza formalmente ou encerra/libera o worker. Ausência de resposta ou estado incerto não autoriza retry concorrente.
- Em interrupção, concluir o ponto atômico e gravar `docs/checkpoints/<task-id>.md`, sem segredos nem logs completos.
- Relatórios têm no máximo 5 linhas; detalhes duráveis ficam na spec ou no checkpoint.
- Atualizar este arquivo apenas com fatos confirmados; não converter branch, teste, preview ou protótipo em conclusão sem evidência.
- Commit, push, PR, merge e contato externo exigem seus gates explícitos; o gate desta tarefa cobre somente o commit de `docs/STATE.md`.
