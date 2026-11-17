---
id: E06-T27
epic: E06
depends_on: [E06-T26, E10-T09]
---

# Integrar a agenda consolidada

## Objetivo

Revisar os commits existentes da grade, editor, carregamento por intervalo e remarcação, preservando as atualizações de developer.

## Entradas

- docs/architecture/TARGET-ARCHITECTURE.md — Semântica, Boundaries, React e Server Actions
- docs/implementation/AJUSTES-DA-AGENDA.md
- docs/implementation/SCHEDULE-PLANO-TECNICO.md
- src/features/training/ui/components/training-week-grid/training-week-grid.tsx
- src/features/training/application/get-training-week.ts

## Critérios de aceite

- [ ] Integrar a PR de Mira antes desta entrega.
- [ ] Reconciliar a documentação de catálogo com a PR E09-T10.
- [ ] Confirmar CI e teste de navegação, intervalos e remarcação.
- [ ] Validar desktop e mobile após reconciliação.

## Resultado

Branch recuperada dos commits 5f9b0ce, c2d95b3, 6504bdb, ace23c1, 0843cf2, 5cc51b1 e 7f59fe4. A PR fica em rascunho até concluir as verificações.
