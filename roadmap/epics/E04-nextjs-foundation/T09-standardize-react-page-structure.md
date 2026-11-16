---
id: E04-T09
epic: E04
depends_on: [E04-T04]
---

# Padronizar estrutura das páginas React

## Objetivo

Deixar as entradas de rota finas e separar renderização, estilos, contratos,
constantes e interatividade dos componentes existentes, preservando o resultado
visual e mantendo Server Components como padrão.

## Contexto

O shell já estabelece a fronteira mínima entre servidor e cliente, mas as
páginas placeholder de Dieta e Treino ainda concentram markup e classes na
entrada de rota. A página técnica `/foundations` também mantém toda a árvore no
cliente por causa de uma única demonstração interativa. Esta tarefa corrige
essas responsabilidades sem antecipar as features E06 e E07.

## Entradas

- `AGENTS.md`
- `CHANGELOG.md`
- `roadmap/ACTIVE.md`
- `roadmap/README.md`
- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/app/dieta/page.tsx`
- `src/app/treino/page.tsx`
- `src/app/foundations/page.tsx`
- `src/features/foundations/components/foundations-page/foundations-page.test.tsx`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/shared/app-shell/app-shell.tsx`
- `src/components/shared/app-shell/app-shell.types.ts`
- `src/components/shared/app-shell/app-shell.module.css`
- `src/components/shared/app-shell/app-shell.test.tsx`
- `src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.tsx`
- `src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.types.ts`
- `src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.constants.ts`
- `src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.utils.ts`
- `src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.module.css`
- `src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.test.tsx`
- `src/components/shared/app-shell/components/app-shell-navigation/hooks/use-app-shell-navigation.ts`
- `src/components/shared/feature-placeholder/feature-placeholder.tsx`
- `src/components/shared/feature-placeholder/feature-placeholder.types.ts`
- `src/components/shared/feature-placeholder/feature-placeholder.constants.ts`
- `src/components/shared/feature-placeholder/feature-placeholder.styles.ts`
- `src/components/shared/feature-placeholder/feature-placeholder.test.tsx`
- `src/features/foundations/components/foundations-page/foundations-page.tsx`
- `src/features/foundations/components/foundations-page/foundations-page.styles.ts`
- `src/features/foundations/components/foundations-page/components/foundations-page-header/foundations-page-header.tsx`
- `src/features/foundations/components/foundations-page/components/foundations-page-header/foundations-page-header.styles.ts`
- `src/features/foundations/components/foundations-page/components/foundations-typography-section/foundations-typography-section.tsx`
- `src/features/foundations/components/foundations-page/components/foundations-typography-section/foundations-typography-section.styles.ts`
- `src/features/foundations/components/foundations-page/components/foundations-actions-section/foundations-actions-section.tsx`
- `src/features/foundations/components/foundations-page/components/foundations-actions-section/foundations-actions-section.styles.ts`
- `src/features/foundations/components/foundations-page/components/foundations-alerts-section/foundations-alerts-section.tsx`
- `src/features/foundations/components/foundations-page/components/foundations-alerts-section/foundations-alerts-section.styles.ts`
- `src/features/foundations/components/foundations-page/components/foundations-form-section/foundations-form-section.tsx`
- `src/features/foundations/components/foundations-page/components/foundations-form-section/foundations-form-section.styles.ts`
- `src/features/foundations/components/foundations-page/components/foundations-colors-section/foundations-colors-section.tsx`
- `src/features/foundations/components/foundations-page/components/foundations-colors-section/foundations-colors-section.types.ts`
- `src/features/foundations/components/foundations-page/components/foundations-colors-section/foundations-colors-section.constants.ts`
- `src/features/foundations/components/foundations-page/components/foundations-colors-section/foundations-colors-section.styles.ts`
- `src/features/foundations/components/foundations-page/components/foundations-motion-section/foundations-motion-section.tsx`
- `src/features/foundations/components/foundations-page/components/foundations-motion-section/foundations-motion-section.styles.ts`
- `src/features/foundations/components/foundations-page/components/foundations-sheet-example/foundations-sheet-example.tsx`
- `package.json`
- `.github/workflows/ci.yml`
- `scripts/validate-component-structure.mjs`
- `scripts/validate-component-structure.test.mjs`

## Entregáveis

- Entradas de rota limitadas à composição e aos dados estáticos da rota.
- Placeholder compartilhado com renderização, estilos, contratos e testes separados.
- `/foundations` server-side com a demonstração de `Sheet` isolada em uma ilha Client.
- Convenções verificáveis sem arquivos vazios ou abstrações sem consumidor.
- Cada componente encapsulado em pasta própria, inclusive filhos privados.
- Validador local e de CI impedindo componentes soltos ou auxiliares sem ownership.

## Fora do escopo

- Implementar dados, formulários ou regras reais de treino e alimentação.
- Criar Server Actions, acesso a banco, sessão, providers ou cliente HTTP interno.
- Alterar primitives, tokens, versão ou API pública de `@fradelli/ui`.
- Redesenhar o shell ou modificar o comportamento visual aprovado na E04-T04.

## Subtarefas

- [x] Extrair o placeholder reutilizado por Dieta e Treino para componente compartilhado.
- [x] Separar props e composição de classes em arquivos com responsabilidade explícita.
- [x] Manter `src/app/dieta/page.tsx` e `src/app/treino/page.tsx` como Server Components finos.
- [x] Mover a composição visual de foundations para uma família de componente própria.
- [x] Restringir `"use client"` ao exemplo interativo que realmente usa `Sheet`.
- [x] Separar a lista fixa de amostras de cor em constantes tipadas.
- [x] Separar as seções privadas de Foundations para manter a composição principal legível.
- [x] Encapsular cada seção privada em pasta própria com seus arquivos auxiliares.
- [x] Encapsular AppShellNavigation e suas responsabilidades em pasta própria.
- [x] Mover e ampliar testes sem alterar nomes acessíveis ou comportamento.
- [x] Auditar layout, redirect, estilos globais e a família AppShell sem criar alterações artificiais.
- [x] Automatizar a regra de pastas e ownership no gate de qualidade.
- [x] Não criar hooks, utils, tipos ou barrels sem responsabilidade concreta.

## Validações

- `page.tsx` contém somente composição de rota e permanece sem `"use client"`.
- Apenas componentes que usam hooks, estado ou APIs do navegador possuem `"use client"`.
- Client Components não importam Prisma, dados, application layer ou módulos server-only.
- Dieta, Treino e Foundations preservam conteúdo, landmarks, foco e navegação.
- Viewport de 320 px e zoom de 200% não geram rolagem horizontal.
- Formato, lint, tipos, testes, integridade, build e auditoria passam.
- O validador estrutural rejeita componentes soltos e auxiliares misturados.

## Critérios de aceite

- [x] O JSX das entradas de rota não concentra estilos nem blocos visuais reutilizáveis.
- [x] O placeholder possui dois consumidores reais e pode ser removido quando E06/E07 o substituírem.
- [x] `/foundations` renderiza sua composição estática no servidor.
- [x] A menor ilha Client contém somente a demonstração interativa necessária.
- [x] Nenhum arquivo existe apenas para satisfazer uma convenção nominal.
- [x] Nenhum diretório `components/` contém arquivos de componentes soltos.
- [x] A convenção permanece protegida por teste de regressão e gate de CI.

## Riscos

- Criar abstração temporária maior que os dois placeholders consumidores.
- Alterar a demonstração técnica de foundations durante uma refatoração estrutural.
- Empurrar primitives do Design System ou dados server-only para módulos client.

## Rollback

Reverter as extrações e restaurar as páginas da E04-T04/E04-T08, sem alterar o
shell, a integração do Design System ou os contratos de dados.

## Resultado

Páginas React padronizadas com entradas de rota finas, componentes encapsulados
em pastas próprias e responsabilidades auxiliares colocalizadas. Foundations
passou a renderizar no servidor com apenas o exemplo de `Sheet` no cliente, e o
novo gate `structure:check` protege a convenção localmente e na CI. Conteúdo,
acessibilidade e resultado visual foram preservados; todos os gates passaram.

## Consolidação documental de 12/11/2026

Pasta própria, ownership de auxiliares e Server/Client estão na arquitetura/validador. Inventário da base antiga permanece na origem.

[Pacote original integral](https://github.com/fradelli/nextjs-kaizen-app/blob/fd2269d2eaa7d55cfea724631f12fa6505d37b32/docs/implementation/tasks/E04-T09.md), SHA-256 `b25d690846bba03530cf7bb02a17c0412bfe43207220fef0fdc7873f7c118661`. Comandos, critérios, riscos e rollback registram aquela base e não são receita para reinstalar a aplicação atual. Pendências não viraram aprovações nesta consolidação.
