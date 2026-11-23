---
id: E06-T09
epic: E06
depends_on: [E06-T03]
---

# Projetar a experiência do contador de descanso

## Objetivo

Definir a UX mobile e acessível de um contador regressivo para o descanso prescrito entre séries, sem implementar o cronômetro nesta tarefa.

## Decisões de produto já tomadas

- O contador começa somente por ação explícita em um botão.
- Um painel flutuante no topo não bloqueia o restante da aplicação; portanto, não deve usar a semântica modal de `AlertDialog`.
- Os controles são iniciar/retomar, pausar e reiniciar, como um player compacto.
- O `×` para e descarta a contagem.
- O contador de descanso é distinto do cronômetro da atividade inteira.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.tsx`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-timer/training-activity-timer.tsx`

## Entregáveis

Não registrado na versão original desta tarefa; conteúdo equivalente na seção «Entregáveis e impactos».

## Subtarefas

Não registrado na versão original desta tarefa.

## Validações

Não registrado na versão original desta tarefa.

## Entregáveis e impactos

- Fluxo visual de posição, abertura, foco, anúncios acessíveis, atualização de tempo, conclusão, reinício e fechamento.
- Comparação curta entre painel não modal, modal, bottom sheet e mini-player, justificando a opção já preferida para mobile.
- Decisão sobre navegação entre exercícios/dias, segundo plano, recarregamento da página e múltiplos descansos iniciados.
- Verificação de componentes do Design System antes de criar apresentação local.

## Fora de escopo

- Implementar timer, notificações do sistema, áudio ou serviço em segundo plano.

## Decisões antes da implementação

- Definir comportamento quando a contagem chega a zero e quando o usuário sai da página.
- Apresentar a UX final ao proprietário e aguardar aprovação explícita para a E06-T10.

## Critérios de aceite

- [ ] O fluxo mobile e os estados do painel estão documentados e aprovados.
- [ ] Não há bloqueio de interação nem promessa de funcionamento em segundo plano sem validação.

## Resultado

Ainda não iniciada.
