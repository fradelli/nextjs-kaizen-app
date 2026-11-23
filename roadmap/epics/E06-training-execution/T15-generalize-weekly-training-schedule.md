---
id: E06-T15
epic: E06
depends_on: [E06-T11]
---

# Generalizar a programação semanal de atividades

## Objetivo

Permitir que a semana planejada descreva sessões estruturadas, práticas esportivas,
treinos específicos, mobilidade e descanso sem regras fixas de futevôlei ou de jogo
no fim de semana.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `data/schedule.json`
- `schemas/schedule.schema.json`
- `src/features/training/domain/training-weekly-schedule.ts`
- `src/features/training/data/ensure-scheduled-training-day.ts`
- `src/features/plan-definition-import/domain/plan-definition-source.types.ts`
- `prisma/models/training.prisma`

## Entregáveis

- Modelo de agenda semanal genérico, com tipo, referência ou nome, dia, horário e
  duração planejada quando aplicável.
- Materialização somente da data consultada, respeitando as decisões da E06-T11.
- Suporte a mais de uma atividade estruturada no mesmo dia e a sessões de reserva
  definidas no plano, mas sem vínculo obrigatório com um dia da semana.
- Migração explícita e reversível do formato da agenda atual, preservando versões
  históricas e IDs estáveis.
- Validação de esquema, importação e testes de dias com múltiplas atividades,
  descanso, ausência de horário e referências inválidas.

## Subtarefas

Não registrado na versão original desta tarefa.

## Validações

Não registrado na versão original desta tarefa.

## Fora de escopo

- Importar o novo treino pessoal, limpar o banco ou criar editor visual de planos.
- Agrupar exercícios combinados, cuja estrutura é preservada na importação E06-T16 e cujo fluxo guiado pertence à E06-T18.

## Decisões antes da implementação

- Reavaliar o formato com o novo plano fornecido pelo usuário e aprovar a migração.

## Critérios de aceite

- [x] A agenda não depende de esporte, dia de jogo ou duração codificados no aplicativo.
- [x] Uma sessão de reserva pode existir sem ser materializada automaticamente.
- [x] Planos históricos e atividades executadas permanecem rastreáveis.

## Resultado

Agenda 2.0 implementada com entradas genéricas, horários e referências de preparação. Leitura histórica 1.0 preservada; sábado e domingo sem atividade fixa. Tipos, lint, validação de dados e testes unitários aprovados. Migração local aplicada após backup; validação integrada final faz parte da importação E06-T16.
