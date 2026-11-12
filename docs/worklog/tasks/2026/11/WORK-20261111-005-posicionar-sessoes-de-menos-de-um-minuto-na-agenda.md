---
id: WORK-20261111-005
title: Posicionar sessões de menos de um minuto na agenda
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

# Posicionar sessões de menos de um minuto na agenda

## Contexto

Próximo passo aprovado após validação da finalização

## Objetivo

Mostrar sessões curtas no horário real, preservando medidas e acesso aos detalhes

## Escopo

- Geometria e apresentação de sessões curtas na grade

## Fora de escopo

- Não informado.

## Critérios de aceite

- Sessão concluída de segundos aparece na grade e na lista acessível sem alterar persistência nem duração real

## Atualizações

### 2026-11-11

- Registro iniciado.

### 2026-11-11

- Atividade: Prévia e servidor temporários encerrados; nenhum registro foi gravado no banco para a conferência visual.
- Solução: Geometria usa timestamps compatíveis com os horários reais e preserva correções; marcadores de 3 px e lista filtrada com alvos de 44 px para sessões abaixo de um minuto.
- Evidência: 26 testes aprovados na rodada inicial de geometria, lista e reconciliação.
- Evidência: Prévia sintética no navegador conferida em 1280 e 390 px; lista separou duas sessões de dez segundos e preservou a sessão longa fora do filtro.

### 2026-11-11

- Tarefa concluída.
- Evidência: 26 testes, formatação, lint dos arquivos alterados, estrutura, 330 mensagens, tipos e build final aprovados; rota temporária ausente do build final.
- Evidência: Conferência em navegador a 1280 e 390 px confirmou marcadores compactos e duas sessões breves separadas na lista.

## Resultado final

- Sessões de menos de um minuto são posicionadas com precisão de segundos e acessadas por lista filtrada, preservando horários corrigidos, medidas persistidas e recuperação local.

## Próximos passos

- Conferir teclado, área segura e interação por toque em aparelho físico; demais etapas de Planos seguem o plano aprovado.
