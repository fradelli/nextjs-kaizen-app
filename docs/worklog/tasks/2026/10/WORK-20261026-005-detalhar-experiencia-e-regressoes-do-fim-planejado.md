---
id: WORK-20261026-005
title: Detalhar experiência e regressões do fim planejado
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

# Detalhar experiência e regressões do fim planejado

## Contexto

Usuário solicitou planejamento detalhado antes da implementação da E06-T19.

## Objetivo

Definir comportamento previsível e cobertura de riscos sem alterar código.

## Escopo

- Planejamento detalhado da E06-T19

## Fora de escopo

- Não informado.

## Critérios de aceite

- Políticas de interação, falha, edição, validação e regressão documentadas

## Atualizações

### 2026-10-26

- Registro iniciado.

### 2026-10-26

- Atividade: Detalhado o plano da E06-T19 com estados, textos, envio, falhas, acessibilidade, arquivos previstos, matriz de regressão e reversão.
- Achado: Formulário compartilhado entre inclusão e edição; refresh após sucesso exige testar campos controlados e revisão concorrente.
- Achado: Atualização resolve definição pelo plano ativo; cenário de atividade de versão anterior é gate antes de habilitar cálculo na edição.
- Decisão: Cálculo por minutos civis sem Date ou módulo 24h; preservar alteração manual, inclusive fim apagado; não iniciar implementação nesta etapa.
- Evidência: Inspecionados formulário, DTO, drawer, feedback compartilhado, mutação e validação de horários, sem alteração funcional.

### 2026-10-26

- Tarefa concluída.
- Evidência: Links, caminhos de entrada e padrões de segredo conferidos; integridade de dados, formatação e git diff --check aprovados.

## Resultado final

- Planejamento detalhado da E06-T19 concluído, incluindo experiência de inclusão/edição, estados, falhas, histórico, segurança, acessibilidade, matriz de testes e rollback.

## Próximos passos

- Revisar a proposta antes de implementar; iniciar pela comprovação da preservação de sessão e versão histórica.
