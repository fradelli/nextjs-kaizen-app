# Instruções do roadmap

## Fontes de verdade

- `roadmap/README.md` guarda o status canônico de épicos e tarefas.
- `roadmap/ACTIVE.md` aponta a única tarefa selecionada e sua próxima ação.
- O arquivo individual guarda escopo, entradas, entregáveis, passos, aceite e resultado; não repete status.

Estados permitidos: `PLANNED`, `READY`, `IN_PROGRESS`, `BLOCKED`, `DONE` e `CANCELLED`. Deve existir no máximo uma tarefa `IN_PROGRESS`.

## Edição

- IDs `E00-T01` são estáveis e dependências usam somente IDs existentes, sem ciclos. Condições que não são tarefas ficam em `external` no frontmatter e aparecem com o mesmo texto na coluna de dependências do índice.
- Toda tarefa tem as sete seções do modelo (Objetivo, Entradas, Entregáveis, Subtarefas, Validações, Critérios de aceite, Resultado). Seções próprias são permitidas; não renomeie nem remova seções existentes.
- Uma tarefa possui um arquivo; subtarefas permanecem nele.
- `Entradas` lista caminhos exatos e seções quando o documento for extenso. Não use expressões vagas como “todos os documentos” ou “resultado anterior”.
- Ao concluir, marque os passos e critérios comprovados, preencha `Resultado`, atualize `roadmap/README.md`, `roadmap/ACTIVE.md` e `CHANGELOG.md`.
- O status do épico deve corresponder às suas tarefas; um épico pode estar `READY` quando sua primeira tarefa está `READY`.
- Não iniciar tarefa que não esteja `READY` ou `IN_PROGRESS`.

## Leitura

Leia apenas a tarefa ativa. O README do épico e o índice global são necessários somente para alterar ordem, dependências ou status. Tarefas concluídas são evidência histórica, não contexto padrão.

Uma tarefa selecionada `DONE` é checkpoint de retomada, não ordem para repetir implementação. A próxima ação identifica trabalho residual e limites. O diário operacional registra sessões com outra granularidade; não define status de tarefa de produto.

## Visualização

`pnpm roadmap:view` gera os dados e o build da página (React com `@fradelli/ui`, em `roadmap/view/`) e imprime o caminho de `roadmap/view/dist/index.html`, local e fora do Git. A página só lê estas fontes; estados continuam mudando aqui, nos arquivos. Regere depois de alterar tarefas, estados ou documentos.

## Validação

Confirme IDs únicos, dependências existentes, ausência de ciclos, links válidos, no máximo uma tarefa `IN_PROGRESS`, alinhamento do ponteiro ativo e checklists coerentes com tarefas concluídas. `pnpm docs:check` verifica seções, dependências iguais no frontmatter, no índice e na tabela do épico, cabeçalhos, catálogo e links.
