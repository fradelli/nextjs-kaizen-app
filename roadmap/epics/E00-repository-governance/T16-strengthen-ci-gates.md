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

- [x] Corrigir o validador de i18n e cobrir com testes.
- [x] Remover as chaves órfãs.
- [x] Incluir i18n e formatação do Prisma no workflow.
- [x] Ajustar a cobertura e separar os ambientes de teste.
- [x] Decidir e aplicar a política de cache.

## Validações

- `pnpm i18n:check`, `pnpm test:coverage`, `pnpm test:ci-scripts` e `pnpm run ci` passam localmente.
- O PR desta tarefa mostra os novos passos executados no CI.
- Um texto fixo inserido de propósito em `src/features/schedule/ui` faz o i18n falhar.

## Critérios de aceite

- [x] Todo gate de `pnpm run ci` roda também no CI remoto.
- [x] O i18n detecta texto fixo na agenda e chaves sem uso.
- [x] A cobertura reportada considera todos os arquivos de `src/`.

## Resultado

Concluída em 2026-11-23.

- `scripts/validate-i18n.mjs` foi refeito em funções testáveis (`scripts/validate-i18n.test.mjs`, 5 testes, incluído em `pnpm test:ci-scripts`). Ignora entidades HTML e a marca (`kaizen`, `改善`), inspeciona `src/app`, `src/components` e `src/features/*/ui` (exceto a vitrine `foundations`) e acusa chaves sem referência. Um texto fixo temporário em `src/features/schedule/ui` fez o gate falhar.
- 75 chaves sem uso removidas de `messages/en.json` e `messages/pt-BR.json`; restam 349 mensagens, todas referenciadas.
- O job Quality passou a rodar `pnpm db:format:check` (script novo) e `pnpm i18n:check`; o `pnpm run ci` ganhou `db:format:check`. O schema em `prisma/models/` foi formatado, com mudança só de espaços (zero linhas diferentes com `git diff -w`).
- `vitest.config.ts`: projetos `node` (domínio, aplicação, dados, `tests/` e `prisma/`) e `dom` (componentes e hooks de UI); `coverage.include` cobre todo `src/`. A suíte unitária caiu de 144 s para 55 s; `scripts/validate-data.test.mjs` deixou de rodar duas vezes (segue no `test:ci-scripts`).
- Cobertura real sobre todo `src/`: 61,26% de linhas, 60,66% de funções, 57,57% de branches e 59,68% de statements. Os thresholds de 80% passaram a esse piso (61/60/57/59), como trava contra regressão. Lacuna conhecida: as camadas `data` e `app` só são exercitadas pela suíte de integração, que não mede cobertura.
- Cache de dependências mantido desligado, com a decisão comentada em `.github/workflows/ci.yml`: a instalação leva de 10 a 14 s por job, em paralelo.
- Validações locais: `pnpm i18n:check`, `pnpm test:coverage` (80 arquivos, 577 testes), `pnpm test:ci-scripts`, `pnpm lint`, `pnpm typecheck`, `pnpm structure:check`, `pnpm data:check`, `pnpm docs:check`, `pnpm db:validate`, `pnpm db:format:check`, `pnpm format:check` e `git diff --check`. Integração, build e audit ficaram para o CI.
