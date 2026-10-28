---
id: E10-T05
epic: E10
depends_on: [E10-T04]
---

# Unificar comportamento dos diálogos

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.types.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-completion-dialog/training-activity-completion-dialog.tsx`

## Resultado

Confirmações usam TrainingActivityModal, com X, Escape e clique externo centralizados,
foco inicial seguro configurável, retorno de foco e bloqueio durante envio. Eventos de
Escape não propagam para o modal anterior; a navegação por Tab exclui diálogos filhos.
Exclusão e finalização mantêm seus comandos, estados e preservação de preenchimento.
Removidos dois módulos de estilos sem consumidores. Botões usam as mesmas variantes
e tamanhos dos formulários, mantendo destruição à esquerda e ação principal à direita.

45 testes, tipos, lint, estrutura e build aprovados. Chromium em 320/1440px confirmou
fechamento por X, Escape e clique fora; fechar a confirmação mantém editor e bloqueio
de rolagem. Nenhuma atividade excluída na validação. Alterações locais sem commit.
