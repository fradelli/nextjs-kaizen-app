---
id: E07-T03
epic: E07
depends_on: [E07-T02]
---

# Registrar escolhas, cumprimento e comentários

## Objetivo

Apresentar as opções aprovadas e registrar o resultado real de cada refeição.

## Entradas

- `docs/plans/nutrition/E07.md`
- `docs/product/P0.md`
- `data/nutrition/active.json`
- `src/lib/security/authorization.ts`
- `src/features/nutrition/`

## Entregáveis

- Componentes e Server Actions de refeição com estado e revisão.

## Subtarefas

- [ ] Diferenciar item principal, complemento e alternativa.
- [ ] Preservar quantidades e unidades originais.
- [ ] Evitar converter alternativa em equivalência clínica.
- [ ] Registrar `followed_plan`, `followed_different`, `skipped` e comentário.
- [ ] Exigir descrição para refeição diferente e limpar campos incompatíveis.
- [ ] Preservar rascunho em erro e detectar concorrência.

## Validações

- Conferir opções contra o plano público e transições contra as regras do P0.

## Critérios de aceite

- [ ] Recarregar restaura o registro sem alterar o plano ou expor outro workspace.

## Resultado

Ainda não concluída.
