---
id: E00-T10
epic: E00
depends_on: [E00-T09]
---

# Criar a visualização local do roadmap

## Objetivo

Ver e navegar o roadmap, as tarefas e a documentação numa página local, sem serviço novo nem segunda fonte de estado. A página só lê `roadmap/` e `docs/`.

## Entradas

- `roadmap/README.md` — estados canônicos de épicos e tarefas.
- `roadmap/ACTIVE.md` — tarefa selecionada e próxima ação.
- `roadmap/epics/` — tarefas padronizadas pela E00-T09.
- `docs/DOCUMENTATION-STANDARD.md` — cabeçalho comum (tipo e área) dos documentos.

## Entregáveis

- `scripts/build-roadmap-view.mjs` e testes: gera `roadmap/view/data.js`, local e não versionado.
- `roadmap/view/index.html` e `roadmap/view/markdown.js`: página sem dependências e sem rede.
- Comando `pnpm roadmap:view`.

## Subtarefas

- [x] Gerar os dados com estados, ondas, pendências, desbloqueios e prontidão calculados.
- [x] Renderizar Markdown localmente, com HTML escapado e links do repositório convertidos em navegação.
- [x] Criar as telas: visão geral, épico, matriz onda × status, kanban, tarefa, lista de documentos e documento.
- [x] Conferir no navegador, em desktop e em 375 px, nos temas claro e escuro.

## Validações

- `node --test scripts/build-roadmap-view.test.mjs` aprovado.
- Todas as rotas de tarefas, épicos e documentos renderizadas sem erro e sem link interno quebrado.
- Sem rolagem horizontal da página em 375 px.

## Critérios de aceite

- [x] A matriz mostra as ondas por status, com filtro por épico, busca, prontas para começar e finalizadas ocultáveis.
- [x] Clicar numa tarefa abre a descrição renderizada, com dependências, desbloqueios, onda e arquivo de origem.
- [x] Links entre tarefas, épicos e documentos navegam dentro da página; caminhos de código abrem no editor.
- [x] Nenhum estado é gravado ou duplicado: a página lê os arquivos e o gerador calcula.

## Fora de escopo

- Mudar estados pela página ou por CLI.
- Publicar a página ou servi-la pelo aplicativo Next.js.
- Central multiprojeto.

## Resultado

Visualização entregue em `roadmap/view/`. Abrir com `pnpm roadmap:view` e o caminho que o comando imprime. O arquivo de dados contém o caminho local do repositório para os links do editor; por isso fica fora do Git.
