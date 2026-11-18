---
id: E09-T10
epic: E09
depends_on: []
---

# Integrar catálogo de exercícios e equipamentos

## Objetivo

Revisar e integrar o catálogo já preparado localmente, suas validações, tabelas e seed idempotente.

## Entradas

- docs/architecture/TARGET-ARCHITECTURE.md — Semântica e legibilidade, Boundaries, Prisma e migrations
- docs/implementation/CATALOG-IMPORT-PLAN.md
- data/catalogs/exercicios.json
- data/catalogs/equipamentos.json
- scripts/seed-catalog.mjs

## Critérios de aceite

- [ ] Validar catálogo e referências.
- [ ] Confirmar migrações em PostgreSQL descartável e repetição da seed.
- [ ] Confirmar gates do CI.
- [ ] Revisar fontes e pendências editoriais antes da integração.

## Resultado

Trabalho recuperado dos commits locais c34401e, c4272c5, f3c5170 e 65a9eb1. A abertura da PR em rascunho preserva a revisão pendente. A execução da seed em banco operacional exige autorização específica para esse banco.
