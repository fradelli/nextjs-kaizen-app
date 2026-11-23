---
id: E00-T16
epic: E00
depends_on: []
---

# Fortalecer os gates de CI

## Objetivo

Fazer o CI remoto executar os mesmos gates do `pnpm run ci` e fechar as lacunas que deixaram falhas passarem sem aviso.

## Contexto

Achados da auditoria de 2026-11-23 sobre `developer` (`364c71f`):

- `pnpm i18n:check` falha com quatro erros, e `.github/workflows/ci.yml` não executa esse gate.
- Os quatro erros são falsos positivos do validador: entidades HTML (`&rarr;`, `&plusmn;`, `&minus;`) lidas como texto e o nome da marca `kaizen` fora da lista de exceções.
- `scripts/validate-i18n.mjs` não inspeciona `src/features/schedule/ui`, `src/features/training/ui/hooks` nem `src/app/workout`, e não detecta chaves sem uso; cerca de 75 chaves não têm referência no código.
- `npx prisma format --check` aponta arquivos sem formatação; o CI não confere.
- `vitest.config.ts` exige 80% de cobertura sem `coverage.include`; arquivos não carregados por testes ficam fora da conta.
- Toda a suíte roda em jsdom (ambiente somou 586 s na execução local).
- Todos os jobs usam `package-manager-cache: false`, sem decisão registrada.

## Entradas

- `.github/workflows/ci.yml` — jobs e passos.
- `package.json` — script `ci`.
- `scripts/validate-i18n.mjs` — raízes inspecionadas e regra de texto.
- `messages/en.json` e `messages/pt-BR.json` — chaves candidatas a remoção.
- `vitest.config.ts` — cobertura e ambiente.
- `prisma/models/` — arquivos sem formatação.

## Entregáveis

- Passo `pnpm i18n:check` no job Quality.
- `scripts/validate-i18n.mjs` decodificando entidades, ignorando conteúdo `aria-hidden`, com exceção da marca, raízes ampliadas e detecção de chaves sem uso, com teste em `scripts/`.
- Chaves sem uso removidas dos dois catálogos.
- Passo de `prisma format --check` no CI e schema formatado.
- `coverage.include` definido; thresholds revisados se a cobertura real cair.
- Projetos do Vitest com ambiente `node` para domínio, aplicação e dados e `jsdom` para UI.
- Decisão registrada sobre cache de dependências no CI.

## Subtarefas

- [ ] Corrigir o validador de i18n e cobrir com testes.
- [ ] Remover as chaves órfãs.
- [ ] Incluir i18n e formatação do Prisma no workflow.
- [ ] Ajustar a cobertura e separar os ambientes de teste.
- [ ] Decidir e aplicar a política de cache.

## Validações

- `pnpm i18n:check`, `pnpm test:coverage`, `pnpm test:ci-scripts` e `pnpm run ci` passam localmente.
- O PR desta tarefa mostra os novos passos executados no CI.
- Um texto fixo inserido de propósito em `src/features/schedule/ui` faz o i18n falhar.

## Critérios de aceite

- [ ] Todo gate de `pnpm run ci` roda também no CI remoto.
- [ ] O i18n detecta texto fixo na agenda e chaves sem uso.
- [ ] A cobertura reportada considera todos os arquivos de `src/`.

## Resultado

Não iniciada.
