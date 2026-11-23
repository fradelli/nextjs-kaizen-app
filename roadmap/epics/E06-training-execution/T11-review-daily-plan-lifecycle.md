---
id: E06-T11
epic: E06
depends_on: [E06-T03]
---

# Revisar o ciclo de vida do plano diário

## Objetivo

Documentar e decidir as regras de geração, navegação e persistência do dia antes de alterar sua implementação.

## Contexto conhecido

A E06-T03 guarda a agenda semanal na versão do plano e materializa somente a data consultada, em transação, de hoje até hoje + 4 dias. Não há entidade denominada `DailyPlan`; a data é composta por atribuição e atividades. A existência prévia de qualquer atividade ou atribuição impede nova materialização. Confirmar o comportamento no código vigente após o merge.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `data/schedule.json`
- `prisma/models/training.prisma`
- `src/features/training/application/get-training-day.ts`
- `src/features/training/application/resolve-training-day-date.ts`
- `src/features/training/data/ensure-scheduled-training-day.ts`
- `src/app/treino/page.tsx`
- `src/features/training/data/prisma-training-repository.ts`

## Entregáveis

Não registrado na versão original desta tarefa; conteúdo equivalente na seção «Entregáveis e impactos».

## Subtarefas

Não registrado na versão original desta tarefa.

## Validações

Não registrado na versão original desta tarefa.

## Entregáveis e impactos

- Fluxo atual comprovado: template semanal, acesso ao dia, criação, persistência, proteção contra duplicação e retorno à UI.
- Decisão entre leitura futura sem persistência, limite de navegação ou outra solução simples; não mudar arbitrariamente o limite atual.
- Regra para dia parcialmente criado, inclusive atividade manual adicionada antes da primeira materialização, exclusão intencional e descanso.
- Decisão de feedback de carregamento mobile quando houver geração perceptível.
- Casos de concorrência, fuso `America/Sao_Paulo`, limites do passado e do futuro.

## Fora de escopo

- Implementar outra estratégia antes da aprovação ou pré-gerar mês inteiro.
- Limpar dados operacionais ou importar uma nova programação semanal.

## Decisões antes da implementação

- Aprovar a política de leitura/persistência e o limite futuro; qualquer tarefa de código derivada requer nova análise e aprovação.

## Critérios de aceite

- [x] O fluxo real está documentado sem supor um `DailyPlan` inexistente.
- [x] Decisões de navegação, materialização parcial e feedback estão explícitas.
- [x] Lacunas foram decompostas para E06-T12 e E06-T13 sem implementar código nesta tarefa.

## Resultado

Revisão e decisões aprovadas pelo usuário. O template semanal pertence à versão importada; `getTrainingDay` materializa apenas a data consultada em transação serializável e então projeta a atribuição e as atividades.

- Mantidos hoje até hoje + 4 dias e o fuso `America/Sao_Paulo`; não criar planos passados nem pré-gerar semanas.
- Qualquer atribuição ou atividade existente, inclusive excluída logicamente, impede nova materialização. Não completar automaticamente um dia parcial nem recriar exclusões intencionais. Refinamentos da edição ficam em E06-T12.
- Datas sem entradas no novo formato ficam sem atividades fixas; jogo de sábado só por inclusão manual.
- Mantido o loading da rota; nenhuma confirmação ou mensagem de gravação durante execução local.
- Reconciliação de dias futuros após troca de plano permanece em E06-T13. O reset local autorizado elimina o legado atual, mas não substitui essa regra futura.
