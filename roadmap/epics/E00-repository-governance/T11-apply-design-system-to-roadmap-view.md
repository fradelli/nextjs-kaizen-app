---
id: E00-T11
epic: E00
depends_on: [E00-T10]
---

# Aplicar o design system à visualização do roadmap

## Objetivo

Refazer a visualização local do roadmap da E00-T10 com o design system do Kaizen (`@fradelli/ui`, preset Mira), o logo e as fontes do aplicativo. Ela continua fora do app Next, sem rota nem serviço novo, e só lê as mesmas fontes.

## Entradas

- `docs/product/telas/guia-de-estilo.md` — tipografia, densidade, tema escuro, cores por intenção e regra de consumir o catálogo do pacote.
- `src/components/shared/app-shell/components/kaizen-logo/kaizen-logo.tsx` — composição do logo solar.
- `src/app/layout.tsx` — fontes IBM Plex Sans e Figtree e tema escuro.
- `roadmap/epics/E00-repository-governance/T10-create-local-roadmap-view.md` — telas, dados e cálculos já entregues.

## Entregáveis

- `roadmap/view/` como página React empacotada pelo Vite: `index.html`, `vite.config.mjs` e `src/` (componentes, telas, rotas e renderizador Markdown).
- Componentes de `@fradelli/ui`: Table (matriz), Progress (progresso dos épicos), Card, Badge, StatusIndicator, NavigationItem, Button, Input, NativeSelect, Switch, Label, Tooltip, Collapsible, Item e Kbd; ícones Lucide.
- Logo solar do aplicativo, com a mesma folha de estilos do `KaizenLogo`, e o favicon do Kaizen.
- Table e Progress acrescentados ao design system a partir das receitas oficiais Mira (Base UI) e consumidos pelo pacote local `vendor/fradelli-ui-mira-table-progress.tgz`.
- `vite` 8.2.4 declarado como devDependency, na versão que o lockfile já tinha pelo Vitest.
- `pnpm roadmap:view` gera os dados e o build em `roadmap/view/dist/` (fora do Git).

## Subtarefas

- [x] Trocar a página escrita à mão por componentes React do pacote, mantendo as telas e as rotas da E00-T10.
- [x] Reproduzir o logo solar e as fontes do aplicativo.
- [x] Gerar bundle clássico (IIFE) para a página abrir direto do disco.
- [x] Incluir `roadmap/view/src` no lint e na formatação.
- [x] Conferir no navegador em desktop, 390 e 320 px.

## Validações

- `tsc --noEmit`, `pnpm format:check`, ESLint dos arquivos alterados, `pnpm test:ci-scripts`, `pnpm docs:check`, `pnpm data:check` e `pnpm structure:check` aprovados.
- 221 rotas (tarefas, épicos, documentos e telas) renderizadas sem erro nem link interno quebrado.
- Sem rolagem horizontal da página em 390 e 320 px.

## Critérios de aceite

- [x] A página usa os componentes, tokens, fontes, tema escuro e logo do Kaizen, sem recriar componentes do pacote.
- [x] As informações e controles da E00-T10 continuam: visão geral, épico, matriz onda × status, kanban, tarefa e documentos, com filtros, busca e navegação entre arquivos.
- [x] Abre do disco depois de `pnpm roadmap:view`, sem servidor; só as fontes vêm do Google Fonts.
- [x] Nenhum estado é gravado ou duplicado.

## Fora de escopo

- App próprio de roadmap e controle de tarefas multiprojeto, planejado para depois.
- Rota no app Next.
- Mudar estados pela página.
- Componente de prosa no design system: o registro Base do shadcn/ui não tem receita de tipografia, prosa ou Markdown; o estilo do texto dos documentos continua local (`roadmap/view/src/styles.css`). A barra empilhada por status também continua local, porque o Progress representa um único valor.
- Corrigir o `pnpm i18n:check`, que já falhava em `src/` antes desta tarefa (`training-activity-form`, `training-date-navigation` e `app-shell`).

## Resultado

Visualização refeita com `@fradelli/ui` em `roadmap/view/`. Abrir com `pnpm roadmap:view` e o caminho de `roadmap/view/dist/index.html` que o comando imprime. Os componentes ficam em React para servir de base ao app futuro.
