---
id: E07-T02
epic: E07
depends_on: [E04-T04, E07-T01]
---

# Criar página de dieta do dia

## Objetivo

Exibir a estrutura da data, permitir escolher o tipo do dia e navegar com boa leitura em celular.

## Entradas

- `docs/plans/nutrition/E07.md`
- `docs/product/P0.md`
- `src/features/nutrition/application/nutrition-dto.ts`
- `src/app/dieta/page.tsx`

## Entregáveis

- Página server-rendered da dieta do dia com navegação por data.

## Subtarefas

- [ ] Organizar refeições na ordem prescrita.
- [ ] Implementar data anterior, Hoje e data seguinte em `America/Sao_Paulo`.
- [ ] Exibir horários somente quando confirmados.
- [ ] Solicitar tipo de dia quando ausente sem inventar faixa ou módulos.
- [ ] Indicar dados ausentes sem estimá-los.
- [ ] Implementar estados vazio e de erro.

## Validações

- Testar responsividade, semântica e navegação.

## Critérios de aceite

- [ ] O usuário entende e atribui a estrutura do dia em uma única página.

## Resultado

Ainda não concluída.
