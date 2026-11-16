---
id: E04-T02
epic: E04
depends_on: [E04-T01]
---

# Configurar qualidade estática

## Objetivo

Definir formatação, lint, tipos e testes mínimos antes das features.

## Entradas

- `package.json`
- `tsconfig.json`
- `src/app/page.tsx`

## Entregáveis

- Configurações e scripts definidos no guia de implementação.

## Subtarefas

- [x] Configurar formatação e lint sem correção destrutiva em CI.
- [x] Configurar typecheck e testes.
- [x] Criar convenções de imports e módulos.

## Validações

- Comandos locais retornam sucesso em checkout limpo.

## Critérios de aceite

- [x] Gates são rápidos e reproduzíveis.

## Resultado

Concluída pela [PR #24](https://github.com/fradelli/kaizen-app/pull/24), merge commit `a2962a8f3c52018fdbf235359310622126c75be9`. Foram adicionados Prettier, ESLint, Vitest, Testing Library, cobertura mínima de 80% e scripts reproduzíveis de formato, lint, tipos, testes e build. Qualidade, testes, build e auditoria de dependências foram comprovados; CI, integridade de dados e validação manual permaneceram fora do escopo.

## Consolidação documental de 12/11/2026

Preservada a justificativa original de compatibilidade ESLint 9/TypeScript 6; gates correntes pertencem aos scripts e configurações.

[Pacote original integral](https://github.com/fradelli/nextjs-kaizen-app/blob/fd2269d2eaa7d55cfea724631f12fa6505d37b32/docs/implementation/tasks/E04-T02.md), SHA-256 `ba985c80365710b79f63994a702acf429404073f64cd5374b6aca42c8fade30c`. Comandos, critérios, riscos e rollback registram aquela base e não são receita para reinstalar a aplicação atual. Pendências não viraram aprovações nesta consolidação.
