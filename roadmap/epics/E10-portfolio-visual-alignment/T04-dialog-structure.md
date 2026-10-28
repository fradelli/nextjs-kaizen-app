---
id: E10-T04
epic: E10
depends_on: [E10-T03]
---

# Uniformizar estrutura visual dos diálogos

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.styles.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.styles.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-completion-dialog/training-activity-completion-dialog.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-editor-content/training-activity-editor-content.tsx`

## Resultado

Confirmações reutilizam superfícies, títulos, espaçamentos e divisórias do modal.
Descrição redundante da edição removida; descrição opcional não produz referência
acessível vazia. Preservados fluxo, foco seguro e ações destrutivas à esquerda.

45 testes afetados, lint, estrutura, tipos e build aprovados. Chromium em 320/1440px
confirmou títulos Inter 20px/700/28px e divisória de rodapé de 1px. Sem gravação de
atividades durante a conferência. Alterações locais, sem commit.
