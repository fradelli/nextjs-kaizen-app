---
id: E10-T06
epic: E10
depends_on: [E10-T05]
---

# Rascunhos de formulário por sessão

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/features/training/ui/hooks/use-training-activity-editor-draft/use-training-activity-editor-draft.ts`
- `src/features/training/ui/hooks/use-training-activity-completion-draft/use-training-activity-completion-draft.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-editor-content/training-activity-editor-content.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-completion-dialog/training-activity-completion-dialog.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-completion-form/training-activity-completion-form.styles.ts`

## Resultado

Criação e finalização guardam preenchimento em sessionStorage. Edição não recupera
nem grava rascunho e confirma descarte ao fechar com alterações. Chaves antigas de
formulário em localStorage são removidas ao abrir; execução, pausas e séries continuam
em seu armazenamento separado. Rascunho excluído não reaparece sem nova alteração.

Título Finalizar atividade, mensagem Rascunho salvo nesta sessão, ação Excluir rascunho
no rodapé e formulário em uma coluna, sem fundo/borda/card interno.

55 testes afetados, lint, estrutura, tipos/build aprovados. Chromium confirmou recarga
na mesma aba, nova aba independente, descarte e edição com cancelamento/aceitação da
confirmação, sem salvar atividades. Alterações locais sem commit.

SessionStorage segue o ciclo de sessão do navegador; restauração de sessões ou uma
aba duplicada pode preservar/copiar estado conforme o navegador. Não oferece garantia
de apagamento seguro nem de ausência de restauração após falha do navegador.

## Decisão posterior do usuário

Fechar a edição descarta alterações diretamente, sem confirmação nativa ou outro
diálogo. Esta decisão substitui a confirmação de descarte descrita acima. X, Escape
e clique fora foram verificados no navegador; 21 testes de editor/modal passaram.
Durante envio, o fechamento continua bloqueado.
