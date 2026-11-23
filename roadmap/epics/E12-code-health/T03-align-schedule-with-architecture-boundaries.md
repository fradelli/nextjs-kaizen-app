---
id: E12-T03
epic: E12
depends_on: []
---

# Alinhar a agenda às fronteiras da arquitetura

## Objetivo

Fazer as Server Actions e leituras da agenda seguirem a ordem e as camadas definidas na arquitetura, sem REST interna.

## Contexto

Achados da auditoria de 2026-11-23:

- `src/app/workout/schedule-actions.ts` envia o input `unknown` ao repositório, que valida com Zod em `src/features/schedule/data/prisma-schedule-repository.ts`; a action faz o parse de novo depois.
- A action chama a camada de dados diretamente, sem caso de uso em `application`, e descobre o `id` com cinco ternários aninhados.
- `loadTodoLists`, `loadTodos` e `loadCalendarTrainingDay` não validam a origem; os dois primeiros lançam exceção em vez de devolver resultado tipado, e `loadCalendarTrainingDay` não valida o `civilDate` com Zod.
- `src/app/workout/calendar-day/route.ts` é consumida por `fetch` em `src/features/schedule/ui/components/calendar-range/hooks/use-calendar-days.ts`, o que a arquitetura proíbe ("Não existe REST interna"); a resposta é usada sem validação e as duas leituras rodam em sequência.
- `console.info` de medição ficou em `schedule-actions.ts` e em `prisma-schedule-repository.ts`.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md` — seções "Boundaries", "Server Actions", "Route Handlers" e "Segurança".
- `src/app/workout/schedule-actions.ts` — actions atuais.
- `src/app/workout/calendar-day/route.ts` — rota a remover.
- `src/features/schedule/data/prisma-schedule-repository.ts` — validação e transação.
- `src/features/schedule/application/schedule-command.ts` — schema do comando.
- `src/features/schedule/ui/components/calendar-range/hooks/use-calendar-days.ts` — consumidor da rota.

## Entregáveis

- Caso de uso de mutação da agenda em `src/features/schedule/application/`, recebendo comando já validado.
- `schedule-actions.ts` na ordem: origem, workspace, Zod, comando, caso de uso, resultado tipado.
- Leituras da agenda com validação de origem e de entrada e resultado tipado.
- `calendar-day/route.ts` removida; leitura do dia por Server Action, com as duas consultas em paralelo.
- Medições removidas ou centralizadas num logger com consumidor.

## Subtarefas

- [ ] Extrair o caso de uso e a resolução do identificador afetado.
- [ ] Mover a validação Zod para a fronteira da action.
- [ ] Proteger e tipar as leituras.
- [ ] Substituir a Route Handler por action e atualizar `use-calendar-days.ts`.
- [ ] Remover os `console.info`.

## Validações

- `pnpm test`, `pnpm test:integration` e `pnpm structure:check` passam.
- Testes cobrem origem inválida, entrada inválida, conflito e sucesso das actions.
- `git grep "calendar-day?date"` não retorna resultado.

## Critérios de aceite

- [ ] Nenhuma action da agenda chama a camada de dados sem caso de uso.
- [ ] Nenhuma rota HTTP interna é consumida pela própria UI.
- [ ] Todas as leituras expostas validam origem e entrada.

## Resultado

Não iniciada.
