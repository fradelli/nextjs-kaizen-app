---
id: E06-T20
epic: E06
depends_on: [E06-T12]
---

# Remover treino específico das opções de inclusão

## Cancelamento em 26/10/2026

O usuário decidiu manter a opção Treino específico. A remoção deixou de ser
necessária e a tarefa foi retirada das pendências. O ID é preservado apenas
como histórico; nenhuma alteração de interface, servidor ou dados foi feita.
O escopo abaixo registra a proposta anterior e não autoriza implementação.

## Objetivo

Simplificar a lista de tipos de atividade, retirando a opção Treino específico
por decisão do usuário, sem eliminar dados históricos ou atividades da agenda.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.tsx`
- `src/features/training/ui/components/training-day-page/components/training-agenda-drawer/training-agenda-drawer.tsx`
- `src/features/training/data/prisma-training-repository.ts`
- `src/features/training/domain/training-day.types.ts`
- `prisma/models/training.prisma`
- `data/schedule.json`

## Regras confirmadas

- Não oferecer Treino específico ao adicionar uma nova atividade.
- Manter Treino do plano, Prática esportiva e Mobilidade.
- Não apagar automaticamente enum, histórico ou atividades existentes do tipo `specific_training`.
- Preservar os treinos de futevôlei planejados e seus aquecimentos.

## Decisões antes da implementação

- Reanalisar e apresentar o plano ao usuário antes de implementar.
- A agenda atual usa `specific_training` para futevôlei: decidir se permanece como compatibilidade interna ou passa a outra categoria em nova versão do plano.
- Aprovar como editar e rotular atividades existentes desse tipo sem conversão silenciosa nem perda de dados.
- Decidir se a criação manual também será rejeitada pelo servidor; ocultar a opção não substitui essa decisão de negócio.

## Fora de escopo

- Excluir dados ou reescrever versões históricas sem autorização e migração específica.
- Implementar i18n ou redesenhar o drawer.

## Critérios de aceite

- [ ] Inclusão não oferece Treino específico e mantém as outras três opções.
- [ ] Agenda, aquecimentos e registros existentes continuam consultáveis.
- [ ] Edição de dados legados segue a política aprovada e tem testes.
- [ ] A interface e o servidor aplicam a mesma regra de criação aprovada.

## Resultado

Cancelada por decisão do usuário em 26/10/2026. Treino específico permanece
disponível; nenhuma mudança funcional deve ser realizada por esta tarefa.
