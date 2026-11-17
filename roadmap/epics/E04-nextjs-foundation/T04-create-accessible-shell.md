---
id: E04-T04
epic: E04
depends_on: [E04-T08]
---

# Criar shell acessível

## Objetivo

Criar estrutura visual responsiva e sem regra de negócio consumindo a fundação compartilhada já validada.

## Contexto

Shell, páginas, rotas, marca e composição pertencem ao Kaizen. Tokens, tipografia, foco, estados genéricos e primitives pertencem a `@fradelli/ui`; esta tarefa não pode recriá-los localmente.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `docs/decisions/SHARED-DESIGN-SYSTEM-ADOPTION.md`
- `docs/product/P0.md`
- `src/app/foundations/page.tsx`
- `src/app/layout.tsx`
- `src/app/page.tsx`

## Entregáveis

- Layout, navegação mínima e estados compartilhados aprovados no guia.

## Fora do escopo

- Criar tokens, primitives ou variantes específicas do Kaizen no package.
- Compartilhar calendário, dieta, treino, hábito ou tarefa.
- Alterar a versão do Design System sem validação própria.

## Subtarefas

- [x] Definir landmarks e navegação por teclado.
- [x] Criar layout mobile-first.
- [x] Manter o shell server-side e isolar somente a navegação dependente da rota como ilha Client.
- [x] Separar contratos, constantes, estilos, utilitários e hooks por responsabilidade real.
- [x] Consumir primitives e tokens públicos sem duplicação local.
- [x] Criar loading, vazio e erro somente quando houver repetição real.
- [x] Evitar providers globais sem consumidor.

## Validações

- Navegação e foco funcionam sem mouse.
- Shell não depende de banco.
- Todos os gates de E04-T08 permanecem verdes.

## Critérios de aceite

- [x] Treino e alimentação podem ser encaixados sem duplicar layout.
- [x] O shell permanece local e não amplia a API pública do Design System.

## Riscos

- Recriar localmente um primitive já compartilhado.
- Empurrar navegação ou domínio do Kaizen para o package.

## Rollback

Reverter somente o shell e manter a integração e a página foundations como base técnica validada.

## Resultado

Shell compartilhado entregue como Server Component sobre `@fradelli/ui@0.1.0`,
com navegação Dieta/Treino isolada em uma ilha Client, landmarks acessíveis,
skip link, rota ativa, layout mobile-first e placeholders sem dados de domínio.
Os gates locais e a validação manual passaram; a padronização estrutural das
páginas existentes segue separada em E04-T09.

## Consolidação documental de 12/11/2026

Shell/layout pertencem ao Kaizen; primitives/estados genéricos ao pacote. Ownership permanece na arquitetura e decisão do DS.

[Pacote original integral](https://github.com/fradelli/nextjs-kaizen-app/blob/fd2269d2eaa7d55cfea724631f12fa6505d37b32/docs/implementation/tasks/E04-T04.md), SHA-256 `1d745a46e69ca978eb4076ebff4b9b670bbf97b370af1fbfcb8da7b9861c1266`. Comandos, critérios, riscos e rollback registram aquela base e não são receita para reinstalar a aplicação atual. Pendências não viraram aprovações nesta consolidação.
