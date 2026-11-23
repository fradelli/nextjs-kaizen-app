---
id: E12-T06
epic: E12
depends_on: []
---

# Remover o refresh duplicado após mutações

## Objetivo

Garantir uma única atualização da rota depois de cada mutação de treino.

## Contexto

Achado da auditoria de 2026-11-23: `src/app/workout/training-actions.ts` chama `revalidatePath("/workout")` quando a mutação é salva, e o cliente ainda chama `router.refresh()` em `src/features/training/ui/hooks/use-training-action-feedback.ts` e em outros cinco pontos. O `revalidatePath` dentro de uma Server Action já devolve a árvore atualizada, então a rota é buscada duas vezes.

## Entradas

- `src/app/workout/training-actions.ts` — revalidação.
- `src/features/training/ui/hooks/use-training-action-feedback.ts` — refresh no cliente.
- `docs/architecture/TARGET-ARCHITECTURE.md` — seção "Server Actions", passo 8.

## Entregáveis

- Uma só estratégia de atualização por fluxo, escolhida e aplicada nos seis pontos de `router.refresh()`.
- Exceções justificadas em comentário quando o fluxo não passa por Server Action.

## Subtarefas

- [ ] Mapear os seis pontos de `router.refresh()` e a action de cada um.
- [ ] Remover o refresh redundante.
- [ ] Ajustar os testes que esperam o refresh.

## Validações

- `pnpm test` passa.
- No navegador, salvar uma atividade dispara uma única requisição de atualização da rota.

## Critérios de aceite

- [ ] Nenhum fluxo de mutação atualiza a rota duas vezes.
- [ ] A tela mostra o estado salvo sem recarregar manualmente.

## Resultado

Não iniciada.
