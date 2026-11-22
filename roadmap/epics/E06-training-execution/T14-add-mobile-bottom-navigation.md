---
id: E06-T14
epic: E06
depends_on: [E04-T04]
---

# Mover navegação principal para baixo no mobile

## Objetivo

Apresentar os acessos de Treino e Dieta numa barra inferior em telas mobile, com comportamento de aplicativo, sem duplicar a navegação para leitores de tela.

## Contexto conhecido

Hoje os acessos principais ficam no topo. A mudança visual é transversal ao app, mas está registrada neste épico por ter surgido na revisão da jornada de treino; não contém regra de negócio de treino.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/app/layout.tsx`
- `src/components/shared/app-shell/app-shell.tsx`
- `src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.tsx`
- `src/components/shared/app-shell/components/app-shell-navigation/components/app-shell-navigation-links/app-shell-navigation-links.module.css`
- `src/components/shared/app-shell/app-shell.module.css`
- `src/components/shared/app-shell/app-shell.test.tsx`
- `src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.constants.ts`
- `src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.types.ts`
- `src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.utils.ts`
- `src/components/shared/app-shell/components/app-shell-navigation/hooks/use-app-shell-navigation.ts`
- `src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.test.tsx`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `src/components/shared/app-shell/components/app-shell-navigation/components/app-shell-navigation-links/app-shell-navigation-links.tsx`
- `src/components/shared/app-shell/components/app-shell-navigation/components/app-shell-navigation-links/app-shell-navigation-links.types.ts`
- `src/components/shared/app-shell/components/app-shell-navigation/components/app-shell-navigation-routes/app-shell-navigation-routes.tsx`

## Entregáveis

Não registrado na versão original desta tarefa; conteúdo equivalente na seção «Escopo e impactos».

## Subtarefas

Não registrado na versão original desta tarefa.

## Validações

Não registrado na versão original desta tarefa.

## Comportamento esperado

- Em mobile, Treino e Dieta aparecem fixos na parte inferior com indicação clara da rota ativa e respeito à área segura do dispositivo.
- Em desktop, a navegação permanece no topo.
- A barra não cobre conteúdo, controles ou o painel flutuante de descanso; teclado virtual e leitores de tela continuam utilizáveis.

## Escopo e impactos

- Reavaliar a estrutura real do shell e os componentes disponíveis no Design System antes de escolher os arquivos a alterar.
- Testar foco, navegação por teclado, responsividade, contraste, viewport estreita e safe area.

## Fora de escopo

- Redesenhar as páginas de dieta/treino ou criar navegação para rotas ainda inexistentes.

## Decisões antes da implementação

- Confirmar a largura de transição e o comportamento com teclado virtual na análise da tarefa.
- Reanalisar o código vigente, apresentar solução e trade-offs e aguardar aprovação explícita antes de implementar.

## Critérios de aceite

- [x] Navegação inferior mobile e superior desktop funcionam sem duplicação acessível.
- [ ] Nenhum conteúdo fica encoberto em celular comum ou com safe area.

## Resultado

Plano aprovado em 27/09: abaixo de 768 px, somente ícones na barra inferior;
header com altura, marca e espaçamento menores. Desktop mantém navegação no topo.
Uma única navegação acessível, data válida preservada nos links, safe area e
espaço reservado para não cobrir conteúdo. Troca de rota não altera execução.
Dieta ainda preserva apenas a data na URL enquanto sua jornada não existe.

Implementação começa no Design System: NavigationItem como primitive fundamental
de link e exports BarbellIcon/ForkKnifeIcon sobre Phosphor existente. Admissão
segue a exceção para primitives; a barra composta e rotas ficam no app. API
genérica sem Next.js, tokens ou dependências novos. Changeset minor compatível.

Release depende do workflow oficial do Design System em main após revisão.
Não copiar código ou instalar artefato provisório no Kaizen. Integração e
validação mobile permanecem pendentes até publicar uma versão exata do pacote.

Primeira etapa implementada na branch `codex/mobile-navigation-primitives` do
Design System, sem commit ou PR. `npm run ci` aprovado: 27 testes unitários,
12 testes de Storybook em Chromium, formato, lint, tipos, tokens, build,
tarball e consumidores npm/pnpm com um único React; auditoria sem vulnerabilidades.
Wrappers de ícones expõem apenas tipos React, sem propagar a incompatibilidade
NodeNext das declarações Phosphor ao consumidor. Nenhuma UI do Kaizen alterada
antes da publicação da dependência. Próxima ação exige aprovação de entrega
do Design System e publicação pelo workflow oficial.

Atualização de 27/09: PR #9 integrada; PR #10 corrigida com lockfile alinhado,
CI local e remota aprovadas e merge autorizado. Release oficial 0.3.0 publicado
e instalado por versão exata no Kaizen. Exceção de idade mínima restrita à
versão publicada do pacote próprio, adicionada pelo pnpm.
Integração do shell em validação, sem commit ou PR do Kaizen.

Verificações da integração: 13 testes do shell aprovados; formato, lint,
fronteiras e tipos aprovados. Navegação real Treino/Dieta preservou a data;
viewport de 320 px sem overflow horizontal causado pela barra, dois destinos,
áreas de toque de 48 × 44 px e reserva inferior de 80 px. Desktop mantém
navegação no topo. Teclado virtual e safe area físicos dependem de validação
em dispositivo real; não foram simulados como prova de funcionamento.

`pnpm run ci` aprovado: 280 testes unitários, 41 de integração PostgreSQL,
33 testes dos validadores, formato, lint, estrutura, tipos, dados, build e
auditoria sem vulnerabilidades. Após mover o CSS para o filho responsável,
formato, estrutura, lint, 13 testes do shell e build foram repetidos e aprovados.
Revisão semântica: shell mantém composição Server, leitura de URL fica na
ilha Client, validação de data é pura e a navegação não importa persistência.
Diff revisado sem credenciais ou dados operacionais; `git diff --check` aprovado.

Usuário aprovou o resultado visual e autorizou commit e PR. Tarefa permanece
bloqueada até validar teclado virtual e safe area em dispositivo real.
