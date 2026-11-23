---
id: E12-T08
epic: E12
depends_on: []
---

# Decidir o padrão de estado global e de formulários

## Objetivo

Registrar uma decisão sobre adotar Zustand para estado de cliente compartilhado e React Hook Form para formulários complexos, com critério de quando usar cada um.

## Contexto

Fatos da auditoria de 2026-11-23:

- O projeto não usa Zustand nem React Hook Form.
- Há três caches de cliente feitos à mão com `Map` mutável e `useReducer` para forçar renderização: `use-schedule-entities.ts`, `use-calendar-days.ts` e o rascunho de treino em `use-training-activity-draft.ts`, que usa `CustomEvent`, evento `storage` e varredura do localStorage.
- `schedule-workspace.tsx` cria três contexts e um `useMemo` extenso; `useScheduleWorkspace` junta os contexts de novo.
- `training-activity-form.tsx` tem 391 linhas, seis `useState` e validação manual no `onSubmit`; os demais formulários são simples e usam `useActionState`.
- A arquitetura proíbe dependência sem consumidor e exige decisão explícita para mudar a stack.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md` — seções "Stack escolhida", "Client Components" e "Server Actions".
- `docs/decisions/` — formato das decisões existentes.
- `src/features/schedule/ui/components/schedule-workspace/schedule-workspace.tsx` e `hooks/use-schedule-entities.ts`.
- `src/features/schedule/ui/components/calendar-range/hooks/use-calendar-days.ts`.
- `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.ts`.
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.tsx`.

## Entregáveis

- Decisão em `docs/decisions/` comparando a situação atual, Zustand e alternativas, e React Hook Form com `zodResolver` frente a `useActionState` puro.
- Critérios de uso registrados na seção "Client Components" da arquitetura.
- Versões exatas previstas, sem instalar dependência nesta tarefa.

## Subtarefas

- [ ] Medir re-renderizações e complexidade dos três caches atuais.
- [ ] Avaliar compatibilidade com Server Actions, rascunhos locais e regra de não confirmar antes do servidor.
- [ ] Redigir a decisão e submeter ao responsável.
- [ ] Atualizar a arquitetura com o resultado aprovado.

## Validações

- `pnpm docs:check` passa com a decisão no catálogo.

## Critérios de aceite

- [ ] Decisão aprovada pelo responsável, aceitando ou rejeitando cada biblioteca.
- [ ] Critério de uso explícito para estado local, estado compartilhado e formulários.

## Resultado

Não iniciada.
