---
id: WORK-20261026-003
title: Preparar ajuste do fim planejado do treino
status: concluida
group_id:
jira_key:
jira_status: nao-criada
started_on: 2026-10-26
completed_on: 2026-10-26
due_on:
repositories: kaizen-app
jira_scope_limit_hours: 12
actual_time:
tempo_status: horas-nao-informadas
source_context: Tarefa Codex
---

# Preparar ajuste do fim planejado do treino

## Contexto

Usuário priorizou pequenos ajustes antes da página de Dieta.

## Objetivo

Diagnosticar E06-T19 e apresentar política concreta para aprovação antes de implementar.

## Escopo

- Diagnóstico e plano da E06-T19

## Fora de escopo

- Não informado.

## Critérios de aceite

- Fluxo atual identificado e decisões pendentes apresentadas com recomendação

## Atualizações

### 2026-10-26

- Registro iniciado.

### 2026-10-26

- Achado: Duração já disponível no DTO; campos do formulário não sincronizam sessão e horários; servidor exige fim posterior ao início no mesmo dia.
- Decisão: E06-T19 selecionada READY para aprovação do plano, seguida de E06-T20; pendências E06-T23 e E06-T14 preservadas.
- Solução: Registrada proposta de cálculo automático com preservação manual e tratamento explícito da edição, duração inválida e meia-noite.

### 2026-10-26

- Tarefa concluída.
- Evidência: Código do formulário, duração no DTO e validação de horários no servidor inspecionados.

## Resultado final

- Diagnóstico da E06-T19 e proposta de comportamento documentados; implementação aguarda aprovação prevista na própria tarefa.

## Próximos passos

- Aprovar a proposta, criar branch de implementação a partir de developer e executar a E06-T19.
