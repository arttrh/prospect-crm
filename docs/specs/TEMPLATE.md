# Spec de executor
## Objetivo
<Resultado único e verificável.>

## Contexto mínimo
<Arquivos e módulos que precisam ser lidos.>

## Arquivos permitidos
<Lista fechada de arquivos ou diretórios que podem mudar.>

## Ownership
<Área responsável, resultado de `node scripts/agent-brief.mjs <arquivos permitidos>` e ownership compartilhado, se houver.>

## Graphify
- Repositório: `arttrh/prospect-crm`
- Commit indexado: `<SHA e data, ou não aplicável com justificativa>`
- Operação: `<localização, vizinhos, impacto ou testes>`
- Confirmação local: `<arquivo/trecho vivo que confirmou ou descartou cada inferência, incluindo comparação com o diff atual>`

## Fora de escopo
<O que não deve ser alterado, incluindo código, config, segredos ou integrações.>

## Comportamento esperado
<Estado final observável pelo usuário.>

## Critérios de aceite
- <Critério objetivo 1.>
- <Critério objetivo 2.>

## Como validar
`<comando único ou script existente>`

## Checkpoint
<Quando interromper ou trocar executor, gravar `docs/checkpoints/<task-id>.md` com o template.>

## Formato do relatório
Máximo 5 linhas: `Status | Arquivos alterados | Testes | Bloqueios | Observações`.
