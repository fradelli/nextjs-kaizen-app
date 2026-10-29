---
id: E09-T09
epic: E09
depends_on: []
---

# Internacionalizar a interface atual em português e inglês

## Autorização e escopo

Antecipação autorizada pelo usuário em 29/10/2026. A interface atual pode avançar antes do catálogo novo e das jornadas futuras. Esta entrega não conclui E09-T05/E09-T06/E09-T08 nem altera a política de documentação em português.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `docs/implementation/I18N-PT-EN-PLAN.md`
- `docs/implementation/I18N-UI-IMPLEMENTATION.md`
- `src/i18n/locale.ts`
- `src/i18n/request.ts`
- `src/i18n/next-intl.d.ts`
- `src/i18n/request.test.ts`
- `src/i18n/training-localization.test.tsx`
- `messages/en.json`
- `messages/pt-BR.json`
- `scripts/validate-i18n.mjs`
- `scripts/test-i18n-http.mjs`
- `src/features/training/ui/localize-training-feedback.ts`
- `src/features/training/ui/training-feedback-messages.ts`
- `src/components/shared/feature-placeholder/feature-placeholder.tsx`
- `tests/support/render-localized.tsx`
- `package.json`
- `pnpm-workspace.yaml`
- `next.config.ts`
- `src/app/dieta/page.tsx`
- `src/app/layout.tsx`
- `src/components/shared/app-shell/app-shell.test.tsx`
- `src/components/shared/app-shell/app-shell.tsx`
- `src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.test.tsx`
- `src/components/shared/app-shell/components/app-shell-navigation/components/app-shell-navigation-links/app-shell-navigation-links.tsx`
- `src/components/shared/feature-placeholder/feature-placeholder.test.tsx`
- `src/features/training/application/get-public-training-plan.ts`
- `src/features/training/application/get-training-day.ts`
- `src/features/training/application/training-dto.ts`
- `src/features/training/ui/components/training-day-page/components/invalid-training-date/invalid-training-date.tsx`
- `src/features/training/ui/components/training-day-page/components/rest-training-day/rest-training-day.tsx`
- `src/features/training/ui/components/training-day-page/components/training-action-feedback/training-action-feedback.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-action-feedback/training-action-feedback.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-completion-dialog/training-activity-completion-dialog.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-completion-form/training-activity-completion-form.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-controls/training-activity-controls.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-editor-content/training-activity-editor-content.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-editor-notice/training-activity-editor-notice.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/components/training-preparation-select/training-preparation-select.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-section/training-activity-section.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-timer/training-activity-timer.tsx`
- `src/features/training/ui/components/training-day-page/components/training-agenda-badges/training-agenda-badges.tsx`
- `src/features/training/ui/components/training-day-page/components/training-date-navigation/training-date-navigation.styles.ts`
- `src/features/training/ui/components/training-day-page/components/training-date-navigation/training-date-navigation.tsx`
- `src/features/training/ui/components/training-day-page/components/training-day-content/training-day-content.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-day-content/training-day-content.tsx`
- `src/features/training/ui/components/training-day-page/components/training-day-feedback/training-day-feedback.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-day-loading/training-day-loading.tsx`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/exercise-priority-indicator/exercise-priority-indicator.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/exercise-priority-indicator/exercise-priority-indicator.tsx`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-completed-exercise-correction/training-completed-exercise-correction.tsx`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-exercise-form/training-exercise-form.tsx`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.tsx`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.constants.ts`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.tsx`
- `src/features/training/ui/components/training-day-page/components/training-warmup-toggle/training-warmup-toggle.tsx`
- `src/features/training/ui/components/training-day-page/training-day-page.test.tsx`
- `src/features/training/ui/components/training-day-page/training-day-page.tsx`
- `src/features/training/ui/components/training-day-page/training-day-page.utils.ts`
- `src/features/training/ui/components/training-day-unexpected-error/training-day-unexpected-error.test.tsx`
- `src/features/training/ui/components/training-day-unexpected-error/training-day-unexpected-error.tsx`
- `src/features/training/ui/hooks/use-training-activity-completion-draft/use-training-activity-completion-draft.regressions.test.tsx`
- `src/features/training/ui/hooks/use-training-activity-completion-draft/use-training-activity-completion-draft.test.tsx`
- `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.test.tsx`
- `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.ts`
- `src/features/training/ui/hooks/use-training-activity-editor-draft/use-training-activity-editor-draft.test.tsx`
- `src/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.utils.ts`

## Passos e critérios de aceite

- [x] Resolver inglês/português pelas preferências do navegador e manter fallback inglês.
- [x] Traduzir HTML, metadados, shell e interface de treino disponível.
- [x] Traduzir formulários, acessibilidade, confirmações, rascunhos e erros conhecidos.
- [x] Localizar datas e pluralização conservando regras civis, códigos e unidades.
- [x] Validar paridade de catálogos no CI e interface nos dois idiomas.
- [x] Preservar banco, conteúdo editorial e textos livres para integração do catálogo novo.

## Resultado

290 mensagens em cada idioma. 408 testes passaram, build de produção aprovado e seis cenários HTTP confirmaram idioma inicial e metadados. Lint, tipos, estrutura, fronteiras, ícones e integridade de dados aprovados. Detalhes e limites em [I18N-UI-IMPLEMENTATION.md](../../../docs/implementation/I18N-UI-IMPLEMENTATION.md).
