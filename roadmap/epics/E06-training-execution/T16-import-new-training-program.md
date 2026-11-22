---
id: E06-T16
epic: E06
depends_on: [E06-T15]
---

# Validar e importar a nova programação de treino

## Objetivo

Transformar o novo treino fornecido pelo usuário em definições versionadas e
programação semanal válidas. Sessões alternativas dependem de aprovação específica;
as variantes recebidas foram excluídas desta versão por decisão do usuário.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `data/plans/2026-08-performance-v2.json`
- `data/plans/2026-09-training-v1.json`
- `data/training-execution-metadata.json`
- `docs/guides/TRAINING-GUIDE-2026-09.md`
- `data/schedule.json`
- `data/exercises.json`
- `schemas/training-plan.schema.json`
- `schemas/schedule.schema.json`
- `src/features/plan-definition-import/data/activate-selected-plan-definitions.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.tsx`

## Entregáveis

- Inventário do novo plano: exercícios, sessões, aquecimentos, horários, durações,
  dias de descanso e opções de reserva; lacunas permanecem explícitas.
- Nova versão canônica sem sobrescrever nem reutilizar indevidamente a antiga.
- Variantes reserva não aprovadas ficam fora da ficha ativa; sessões aprovadas podem ser adicionadas manualmente.
- Validação das referências e prévia de uma semana antes da ativação.

## Subtarefas

Não registrado na versão original desta tarefa.

## Validações

Não registrado na versão original desta tarefa.

## Fora de escopo

- Inventar exercícios, prescrições ou horários ausentes.
- Navegação automática entre exercícios combinados, reservada à E06-T18. Nesta entrega, preservar blocos e membros no banco e exibir `Bloco nA/nB`, com navegação manual.
- Apagar dados existentes; o reinício controlado anterior é a E06-T17.

## Decisões antes da implementação

- Receber o novo treino e confirmar as lacunas, sobretudo o que será sessão reserva.
- Confirmar ativação após a entrega do novo treino e o reinício autorizado.

## Critérios de aceite

- [x] O novo plano e a semana passam nas validações de dados e referências.
- [x] Variantes reserva permanecem fora da ficha ativa conforme decisão do usuário.
- [x] Fontes históricas versionadas não foram sobrescritas; o reinício local autorizado está registrado na E06-T17.

## Resultado

Plano aprovado recebido em 25/09/2026: T1 terça, T2 quinta e T3 sexta às 17h; futevôlei de segunda a quinta, 12h–13h30. Jogos são manuais. Variantes reserva ficam fora desta versão. Os 40 minutos são uma meta não validada e incluem aquecimento.

Definições versionadas, quatro aquecimentos e validação de dados implementados. Fonte commitada localmente e importada após o reinício da E06-T17: uma versão de treino, sete sessões, 42 prescrições e 34 exercícios distintos. Alimentação preservada; segunda importação retornou no-op. Consulta da terça-feira projetou futevôlei com aquecimento e T1 com Bloco 3A/3B e 4A/4B. Releitura não duplicou registros; consulta além do limite futuro não criou atividades.

Validação: 258 testes unitários, 40 integrações PostgreSQL (incluindo repetição dos oito testes de importação após adaptar a agenda do cenário histórico), 33 regressões dos scripts, dados, lint, tipos, estrutura, build e diff. Sem push nem PR. A condução automática dos pares permanece fora do escopo.
