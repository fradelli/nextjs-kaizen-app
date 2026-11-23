---
id: E06-T21
epic: E06
depends_on: [E06-T16]
---

# Projetar importação externa de planos de treino

## Objetivo

Definir a fronteira segura para receber um plano final aprovado por JSON enviado
pelo frontend e preparar a extensão posterior para um template Excel, sem expor
ao cliente o snapshot Git, UUIDs internos ou dependências do domínio alimentar.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `docs/plans/training/E06-T21-external-training-plan-import.md`
- `schemas/training-plan.schema.json`
- `schemas/training-execution-metadata.schema.json`
- `src/features/plan-definition-import/domain/plan-definition-source.types.ts`
- `src/features/plan-definition-import/application/import-versioned-plan-definitions.ts`
- `src/features/plan-definition-import/data/persist-plan-definition-snapshot.ts`
- `src/features/plan-definition-import/data/persist-training-plan-definition.ts`
- `src/features/plan-definition-import/data/activate-selected-plan-definitions.ts`
- `prisma/models/platform.prisma`
- `prisma/models/training.prisma`
- `tests/integration/import-versioned-plan-definitions.test.ts`

## Entregáveis

- Contrato intermediário fechado e versionado para um plano candidato, sem UUIDs
  técnicos e com doses estruturadas.
- Decisão documentada de ownership entre o importador Git existente e a nova
  entrada externa, evitando duas regras de persistência concorrentes.
- Fluxo separado de validação, prévia, importação e ativação explícita.
- Contrato de erros por campo, sessão e exercício, adequado ao frontend e ao
  futuro adaptador Excel.
- Plano de idempotência e proveniência para uploads sem `sourcePath` Git.
- Inventário exato de arquivos e migrations necessários para implementar JSON;
  Excel reutiliza o mesmo contrato e não ganha persistência própria.
- Divisão das tarefas de implementação após aprovação das decisões.

## Subtarefas

Não registrado na versão original desta tarefa.

## Validações

Não registrado na versão original desta tarefa.

## Fora de escopo

- Implementar upload, endpoint, Server Action, componentes, parser Excel ou
  migration durante a etapa de projeto.
- Aceitar planilhas arbitrárias por heurística ou IA sem template versionado.
- Inventar exercício, dose, carga, unidade ou programação ausente.
- Remover o importador Git ou alterar dados e ativações existentes.

## Decisões antes da implementação

- Aprovar o contrato `PlanCandidate` e sua estratégia de versionamento.
- Definir a identidade idempotente e a proveniência de um arquivo enviado.
- Decidir se criação e ativação estarão na mesma jornada, mantendo confirmações
  separadas.
- Decidir a representação de carga prescrita em coordenação com E06-T06.
- Confirmar se Excel será implementado após estabilizar JSON em produção.

## Critérios de aceite

- [ ] O contrato externo não depende dos ponteiros ou planos de alimentação.
- [ ] JSON e Excel possuem uma única representação intermediária e uma única
      regra de persistência.
- [ ] A prévia é comprovadamente sem escrita e ativação exige confirmação.
- [ ] IDs técnicos e `workspace_id` nunca são aceitos como ownership do cliente.
- [ ] Histórico, atomicidade, idempotência e rollback possuem comportamento
      definido e casos de teste planejados.
- [ ] A implementação foi dividida em tarefas pequenas, ordenadas e aprovadas.

## Resultado

Ainda não iniciada.
