---
id: E12-T05
epic: E12
depends_on: [E12-T04]
---

# Substituir mensagens de erro em texto por códigos tipados

## Objetivo

Fazer aplicação, dados e Server Actions do treino devolverem códigos de erro tipados, com a tradução feita somente na UI.

## Contexto

Achados da auditoria de 2026-11-23:

- `src/features/training/application/mutate-training-day.ts`, `src/features/training/data/prisma-training-repository.ts` e `src/app/workout/training-actions.ts` devolvem textos fixos em pt-BR no campo `message`.
- `src/features/training/ui/localize-training-feedback.ts` traduz comparando o texto recebido, inclusive com regex sobre a frase em português.
- A agenda já usa códigos (`code: "invalid_command"`, `code: "invalid_origin"`).

## Entradas

- `src/features/training/application/training-mutation.types.ts` — tipo do resultado.
- `src/features/training/ui/localize-training-feedback.ts` e `src/features/training/ui/training-feedback-messages.ts` — tradução atual.
- `src/features/schedule/application/schedule-command.types.ts` — padrão de códigos da agenda.
- `messages/en.json` e `messages/pt-BR.json` — namespace `feedback`.

## Entregáveis

- `TrainingMutationResult` com `code` tipado e parâmetros estruturados (por exemplo a data limite).
- Aplicação, dados e actions sem textos de interface.
- Tradução na UI por código, sem comparação de texto.

## Subtarefas

- [ ] Definir a união de códigos e parâmetros.
- [ ] Atualizar aplicação, repositório e actions.
- [ ] Reescrever a tradução por código e remover o mapeamento por texto.
- [ ] Atualizar testes.

## Validações

- `pnpm test`, `pnpm test:integration` e `pnpm i18n:check` passam.
- `git grep -n 'message: "' src/features src/app` não retorna texto de interface fora de testes.

## Critérios de aceite

- [ ] Nenhuma camada de servidor devolve texto de interface.
- [ ] Todo código de erro tem tradução nos dois idiomas.

## Resultado

Não iniciada.
