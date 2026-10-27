---
id: E06-T24
epic: E06
depends_on: [E06-T12, E06-T19]
---

# Escolher aquecimento e remarcar atividades não iniciadas

## Objetivo

Permitir selecionar um aquecimento do plano ao incluir treino específico e
alterar a data de atividades não iniciadas, preservando horários e aquecimento.

## Decisões aprovadas em 27/10/2026

- Seletor de aquecimento do plano, sugerindo o de futevôlei quando houver
  associação pelo esporte na programação ativa. Permitir Sem aquecimento.
- Remarcação somente antes do início, entre ontem e hoje + 4 dias. Validar
  origem e destino no servidor, usando America/Sao_Paulo.
- Manter os horários, o aquecimento e o ID da atividade. Impedir remarcação
  quando houver execução persistida ou rascunho no navegador.
- Preservar Treino específico, conforme cancelamento da E06-T20.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/app/treino/training-actions.ts`
- `src/features/training/application/training-mutation.types.ts`
- `src/features/training/application/mutate-training-day.ts`
- `src/features/training/application/mutate-training-day.test.ts`
- `src/features/training/application/training-dto.ts`
- `src/features/training/application/get-public-training-plan.ts`
- `src/features/training/application/get-public-training-plan.test.ts`
- `src/features/training/domain/training-day.types.ts`
- `src/features/training/domain/training-edit-window.ts`
- `src/features/training/domain/training-sport.rules.ts`
- `src/features/training/data/prisma-training.mapper.ts`
- `src/features/training/data/prisma-training-repository.ts`
- `src/features/training/data/ensure-scheduled-training-day.ts`
- `src/features/training/data/training-activity-rescheduling.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/components/training-preparation-select/training-preparation-select.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/components/training-preparation-select/training-preparation-select.types.ts`
- `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils.ts`
- `tests/integration/training-activity-scheduling.test.ts`

## Implementação e segurança

- O seletor oferece apenas sessões de preparação públicas e o servidor valida
  sua presença no plano ativo. Manter preserva a referência histórica existente.
- Alterar a data usa o dia original para ownership/revisão e um destino separado.
  A origem não é substituída por entrada arbitrária do cliente.
- Materializar a agenda do destino dentro da mesma transação antes de mover,
  preservando as atividades já previstas. Não copiar ou recriar a atividade real.
- Um marcador excluído logicamente fica na origem para impedir recriação pela
  programação semanal; a atribuição legada permanece ligada ao dia original.
- Aquecimentos filhos acompanham a atividade na mesma transação serializável.
  Erros e concorrência não podem deixar parte da mudança persistida.
- Após sucesso, a interface abre o dia de destino. Falhas preservam o formulário.
- Não criar migration, alterar planos canônicos ou mover registros concluídos.

## Critérios de aceite

- [ ] Aquecimento selecionável e sugestão de futevôlei baseada no plano real.
- [ ] Escolha manual/sem aquecimento e referência histórica preservadas.
- [ ] Campo de data com limites e navegação ao destino após sucesso.
- [ ] Atividade iniciada, aquecimento iniciado e rascunho local bloqueiam remarcação.
- [ ] Remarcação mantém IDs e horários, preserva agenda de destino e não recria origem.
- [ ] Concorrência, rollback, ownership e limites de data cobertos por testes.
- [ ] Qualidade, tipos, testes, build e revisão semântica aprovados.

## Resultado

Implementação concluída na branch; validação final pendente.

- Formatação, lint, estrutura e tipos aprovados.
- 337 testes de aplicação aprovados; cobertura de linhas 90,92% e branches 83,98%.
- 33 testes dos scripts, integridade dos dados canônicos e build aprovados.
- Testes de integração PostgreSQL e navegador pendentes: Docker Desktop falha ao
  iniciar por bloqueio de `sailor-ingest.sock`. Usuário reiniciará o computador.
- A revisão final corrigiu a preservação de Sem aquecimento ao editar horários;
  esse cenário também foi incluído nos testes de integração pendentes.
- Nenhum dado operacional pessoal foi alterado para testar. Não mergear antes
  das validações de banco e navegador.
