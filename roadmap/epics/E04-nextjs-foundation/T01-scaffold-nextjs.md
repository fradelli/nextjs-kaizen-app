---
id: E04-T01
epic: E04
depends_on: [E03-T05, E00-T07]
---

# Criar aplicação Next.js

## Objetivo

Criar o scaffold aprovado sem remover a fundação documental.

## Entradas


## Entregáveis

- Manifesto, configuração e estrutura Next.js definidos no guia.

## Subtarefas

- [x] Fixar versões e package manager.
- [x] Criar App Router e TypeScript.
- [x] Preservar `data/`, `docs/`, `roadmap/` e `schemas/`.
- [x] Registrar comandos locais.

## Validações

- Instalação, execução local e build passam.

## Critérios de aceite

- [x] Página mínima abre localmente.
- [x] Nenhuma feature antecipada foi criada.

## Resultado

Scaffold Next.js 16.3.4 criado com Node.js 24.20.0, pnpm 11.25.0, React 19.2.8 e TypeScript estrito. Instalação e build passaram, e a página mínima respondeu HTTP 200 localmente sem antecipar features, banco ou autenticação.

## Consolidação documental de 12/11/2026

Scaffold, comandos geradores e pins originais são históricos; versões efetivas pertencem ao manifesto/lockfile.

[Pacote original integral](https://github.com/fradelli/nextjs-kaizen-app/blob/fd2269d2eaa7d55cfea724631f12fa6505d37b32/docs/implementation/tasks/E04-T01.md), SHA-256 `ec94f3e07dcc2f5cf8c8ee6bc7460e1b365eff8c3e551c58f2ad18f40b0271b7`. Comandos, critérios, riscos e rollback registram aquela base e não são receita para reinstalar a aplicação atual. Pendências não viraram aprovações nesta consolidação.
