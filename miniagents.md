# Execução supervisionada de agentes no Orca

## Quando delegar

Delegue somente uma tarefa independente, com spec curta, arquivos fechados, ownership definido e validação objetiva. Não delegue uma mudança de uma ou duas linhas, mera execução de checks, decisão de arquitetura, segredo ou integração sem contrato.

## Preparação do Controller

1. Leia `docs/STATE.md` e escreva a spec com `docs/specs/TEMPLATE.md`.
2. Execute `node scripts/agent-brief.mjs <arquivos permitidos>`; divida trabalho entre áreas ou declare ownership compartilhado.
3. Para código indexável, registre a consulta Graphify feita somente pelo MCP em `arttrh/prospect-crm`: commit indexado, operação e confirmação no código vivo e no diff atual.
4. Preserve o cliente nativo, o modelo e a autenticação da sessão. Não troque provedor nem habilite cobrança por API ou proxy.

## Autoridade e isolamento

- Há um executor autoritativo por worktree e uma tentativa autoritativa por tarefa.
- Nenhum executor escreve nos mesmos arquivos, usa o mesmo servidor ou produz os mesmos artefatos em paralelo.
- Retry começa somente depois que a tentativa anterior foi encerrada ou abandonada explicitamente pelo Controller.
- O executor altera apenas os arquivos permitidos, não subdelega e não faz commit, push, PR ou merge sem o gate da spec e de `docs/STATE.md`.

## Ciclo de vida Orca

1. O Controller inicia uma execução supervisionada com Task e Dispatch identificados e entrega objetivo, restrições, ownership e aceite observável.
2. O executor lê STATE e spec, executa o `agent-brief`, trabalha no escopo e valida com os comandos definidos.
3. Perguntas, heartbeats e bloqueios seguem o canal de orquestração da Dispatch; não ficam apenas no chat local.
4. Ao interromper trabalho incompleto, o executor conclui o ponto atômico e cria um checkpoint compacto em `docs/checkpoints/<task-id>.md`, sem segredos nem logs completos.
5. Ao terminar, o executor envia `worker_done` exatamente uma vez, com resultado explícito, arquivos alterados e evidências resumidas em até cinco linhas.
6. O Controller confere o relatório, o Git e as validações; então reutiliza formalmente ou encerra/libera o worker. `worker_done` não substitui essa decisão de lifecycle.

Falha, ausência de resposta ou estado desconhecido não autorizam uma segunda tentativa concorrente. O Controller preserva a worktree e resolve a tentativa vigente antes de despachar outro executor.
