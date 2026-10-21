<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

@/home/arttrh/.codex/RTK.md

# Preferências globais de desenvolvimento

- Responda em português e de forma concisa. Dê explicações completas quando necessárias para segurança e clareza.
- Em tarefas de programação, use Ponytail no modo `full` por padrão. Segurança, acessibilidade e requisitos explícitos nunca podem ser reduzidos.
- A concisão vale para a conversa; código, documentação, commits, comandos, caminhos e erros conservam redação normal e precisa.
- Use Context7 quando documentação atual de bibliotecas, APIs ou ferramentas for pertinente. Nunca envie segredos, credenciais ou conteúdo privado desnecessário.
- Preserve o cliente nativo, o modelo e a autenticação da sessão. Não troque provedor nem habilite cobrança por API ou proxy; em delegação, mantenha explicitamente o mesmo modelo.

# Contrato dos agentes do Prospect CRM

1. Antes de agir, leia `docs/STATE.md` e a spec da tarefa em `docs/specs/`; não invente estado, contrato ou arquivo ausente.
2. Execute `node scripts/agent-brief.mjs <arquivos permitidos>` e use o JSON resultante para confirmar ownership, trabalho entre áreas e validações. Caminho `shared` exige ownership explícito na spec.
3. Para código indexável, use Graphify somente pelo MCP configurado e no repositório autorizado `arttrh/prospect-crm`. Registre na spec repositório, commit indexado, operação e confirmação de cada inferência no código vivo antes de editar; compare também com o diff atual. Graphify orienta navegação, não autoriza mudanças.
4. Respeite o ownership: Backend cuida de rotas, autenticação, dados e integrações server-only; UI de componentes, páginas, estilos, responsividade e acessibilidade; QA valida independentemente e não corrige; Controller mantém estado, specs, gates e coordenação. Mudança entre áreas requer divisão ou ownership compartilhado explícito.
5. Mantenha um executor autoritativo por worktree e uma tentativa autoritativa por tarefa. Não inicie execução concorrente sobre os mesmos arquivos, servidor ou artefatos.
6. Ao atingir o limite de contexto ou interromper trabalho incompleto, conclua o ponto atômico e grave um checkpoint compacto em `docs/checkpoints/<task-id>.md` usando o template. Nunca inclua segredos ou logs completos.
7. Delegação usa Orca supervisionado. O executor envia `worker_done` exatamente uma vez com status, arquivos e evidências; o Controller valida o resultado e encerra ou libera o worker antes de reutilizar a worktree.
8. Commit, push, PR e merge dependem do gate registrado em `docs/STATE.md`. Preserve os oito estágios do funil e os requisitos de acessibilidade.
