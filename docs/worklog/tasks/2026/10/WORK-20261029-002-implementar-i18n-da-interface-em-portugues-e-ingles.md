---
id: WORK-20261029-002
title: Implementar i18n da interface em português e inglês
status: concluida
group_id:
jira_key:
jira_status: nao-criada
started_on: 2026-10-29
completed_on: 2026-10-29
due_on:
repositories: nextjs-kaizen-app
jira_scope_limit_hours: 12
actual_time:
tempo_status: horas-nao-informadas
source_context: Tarefa Codex
---

# Implementar i18n da interface em português e inglês

## Contexto

Retomada autorizada pelo usuário; catálogo novo tratado separadamente

## Objetivo

Localizar interface de treino, mensagens e formatação

## Escopo

- UI e infraestrutura de tradução

## Fora de escopo

- Não informado.

## Critérios de aceite

- Fluxos da interface traduzidos e testes aprovados

## Atualizações

### 2026-10-29

- Registro iniciado.

### 2026-10-29

- Atividade: Traduzidas interface de treino, acessibilidade, formulários, rascunhos, erros e metadados
- Decisão: Conteúdo editorial e traduções persistidas serão integrados ao catálogo novo
- Solução: next-intl por requisição, 289 mensagens em cada idioma e validação no CI
- Evidência: 408 testes em 58 arquivos aprovados; build, lint, tipos, estrutura e seis cenários HTTP aprovados

### 2026-10-29

- Tarefa concluída.
- Evidência: 408 testes completos passaram; quatro testes afetados pela última revisão também passaram; build, lint, tipos, estrutura e verificações HTTP aprovados

## Resultado final

- Interface atual internacionalizada com 290 mensagens em inglês e português, detecção automática e validação no CI

## Próximos passos

- Integrar traduções editoriais ao catálogo novo preservando versões e histórico
