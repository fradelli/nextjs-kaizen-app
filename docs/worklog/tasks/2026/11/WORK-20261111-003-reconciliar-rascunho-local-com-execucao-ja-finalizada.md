---
id: WORK-20261111-003
title: Reconciliar rascunho local com execução já finalizada
status: concluida
group_id:
jira_key:
jira_status: nao-criada
started_on: 2026-11-11
completed_on: 2026-11-11
due_on:
repositories: nextjs-kaizen-app
jira_scope_limit_hours: 12
actual_time:
tempo_status: horas-nao-informadas
source_context: Tarefa Codex
---

# Reconciliar rascunho local com execução já finalizada

## Contexto

Continuação autorizada do Meu Dia

## Objetivo

Reconhecer com segurança a conclusão persistida ao recarregar a página, preservando rascunhos divergentes

## Escopo

- Reconciliação de execução e regressões de rascunho e retomada

## Fora de escopo

- Não informado.

## Critérios de aceite

- Limpeza local somente após correspondência comprovada e testes aprovados

## Atualizações

### 2026-11-11

- Registro iniciado.

### 2026-11-11

- Atividade: Implementada conferência local contra o resultado recebido do servidor e aviso para dados não confirmados.
- Achado: A conferência depende das datas carregadas e da avaliação disponível na aba; não grava no banco. Finalização em navegador e aparelho físico ainda pendentes.
- Decisão: Exigir cópia de avaliação da mesma aba e correspondência de revisão, snapshot, intervalos, exercícios e séries antes da limpeza.
- Evidência: 23 testes de rascunho e reconciliação aprovados na primeira rodada.
- Evidência: Navegador validou abertura sobreposta, início local, retorno à mesma data, retomada pela barra, recarga direta e descarte do rascunho criado no teste.

### 2026-11-11

- Solução: Dados concluídos recebidos do servidor bloqueiam novo início local e eventos antigos; cópias divergentes permanecem disponíveis para conferência.
- Evidência: Rodada final de 55 testes aprovada em quatro arquivos, abrangendo reconciliação, hook de execução, card e barra global.

### 2026-11-11

- Tarefa concluída.
- Evidência: 55 testes aprovados; formatação, lint dos arquivos alterados, estrutura, 328 mensagens, tipos e build de produção aprovados.
- Evidência: Conferidos no navegador sobreposição, retorno à mesma data, retomada pela barra, recarga direta e descarte da execução de teste.

## Resultado final

- Implementada reconciliação conservadora de cópias locais com execuções concluídas, sem escrita no banco, com preservação de divergências e aviso no detalhe.

## Próximos passos

- Validar finalização e resposta perdida no navegador com dados isolados; validar teclado e área segura em celular físico.
