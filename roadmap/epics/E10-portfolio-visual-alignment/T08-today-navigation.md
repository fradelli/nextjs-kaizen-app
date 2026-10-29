---
id: E10-T08
epic: E10
depends_on: [E10-T07]
---

# Ajustar Hoje e entrada do aplicativo

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/app/page.tsx`
- `src/components/shared/app-shell/app-shell.tsx`
- `src/features/training/ui/components/training-day-page/training-day-page.tsx`
- `src/features/training/ui/components/training-day-page/components/training-date-navigation/training-date-navigation.tsx`

## Resultado

Hoje usa amarelo do DS e botão nativo desabilitado, sem esmaecer, na data atual.
Nas demais datas e data inválida, link cinza com hover/foco amarelo. Badge verde
removido. Marca acessível liga à raiz; raiz redireciona para /treino, reutilizando
resolução/canonicalização de hoje em America/Sao_Paulo. Rotas explícitas com outra
data continuam preservadas. Sem alteração no DS, banco ou dados de planos.

394 testes, lint, estrutura, tipos/build e diff check aprovados. Chromium 320/1440px
confirmou estado desabilitado, cor de hover e retorno para hoje pela marca e raiz.
Ajustes publicados junto da E09-T09 na PR [#75](https://github.com/fradelli/nextjs-kaizen-app/pull/75), com destino developer.
