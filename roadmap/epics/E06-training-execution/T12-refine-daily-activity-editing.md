---
id: E06-T12
epic: E06
depends_on: [E06-T11]
---

# Refinar edição de atividades do dia

## Objetivo

Garantir que a instância diária possa divergir do template semanal sem alterar a definição recorrente nem perder atividades independentes.

## Contexto conhecido

Na E06-T03 já há inclusão, edição de horário/tipo e exclusão lógica de atividades não concluídas em um drawer. Esta tarefa deve corrigir apenas lacunas confirmadas pela E06-T11, inclusive o caso de materialização parcial, sem recriar o fluxo existente.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `roadmap/epics/E06-training-execution/T11-review-daily-plan-lifecycle.md`
- `prisma/models/training.prisma`
- `src/features/training/data/ensure-scheduled-training-day.ts`
- `src/features/training/data/prisma-training-repository.ts`
- `src/features/training/ui/components/training-day-page/components/training-agenda-drawer/training-agenda-drawer.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.tsx`
- `src/features/training/application/mutate-training-day.ts`
- `src/features/training/application/get-training-day.ts`
- `src/features/training/application/get-training-day.test.ts`
- `src/features/training/domain/training-sport.rules.ts`
- `src/features/training/domain/training-sport.rules.test.ts`
- `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.ts`
- `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.test.tsx`
- `tests/integration/training-mutations.test.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-controls/training-activity-controls.tsx`
- `data/plans/2026-09-training-v1.json`
- `data/plans/2026-09-training-v1-1.json`
- `data/exercises.json`
- `data/training-execution-metadata.json`
- `schemas/exercise-library.schema.json`

## Entregáveis

Não registrado na versão original desta tarefa; conteúdo equivalente na seção «Escopo e impactos».

## Subtarefas

Não registrado na versão original desta tarefa.

## Validações

Não registrado na versão original desta tarefa.

## Comportamento esperado

- É possível cancelar um jogo do dia, mover um treino para outro horário e adicionar outra atividade, sem mudar a agenda semanal.
- Origem do plano, alteração manual e exclusão intencional permanecem distinguíveis.
- Atividades concluídas e histórico real não são removidos pela edição do planejamento.
- Não completar automaticamente datas já materializadas, conforme E06-T11; exclusões intencionais permanecem respeitadas.

## Correções aprovadas em 26/09

- Alterações, inclusão, exclusão, início e conclusão somente hoje e ontem em America/Sao_Paulo, com validação no servidor.
- Consulta e expansão independentes de início, inclusive em datas futuras; cronômetro exige ação explícita.
- Conclusão parcial envia o rascunho como está, mantendo vazios como zero e sem marcar pendências como feitas.
- Modal: “Há exercícios ou séries incompletos. Deseja voltar ou finalizar com os dados atuais?”; Voltar em destaque, Finalizar secundário.
- Aquecimento não possui séries; validar seu switch sem exigir séries inexistentes.
- Nova versão 1.1.0 com dados de treino em inglês, nomes Push Workout, Pull Workout e Lower Body Workout; preservar fontes históricas e comentários do usuário.
- i18n e navegação inferior não são implementados. Autorização inicial manteve alterações sem commit; em 27/09 o usuário aprovou commit, importação local e PR.

## Escopo e impactos

- Ajustar somente mutações, leitura, UI e testes necessários às lacunas comprovadas.
- Verificar ownership, revisão concorrente, preparação vinculada e horários nulos.

## Fora de escopo

- Editor do template semanal ou replanejamento automático por recomendações.

## Decisões antes da implementação

- Reanalisar o código vigente e as decisões da E06-T11, apresentar plano incremental e aguardar aprovação explícita.

## Critérios de aceite

- [x] Conclusão parcial com aquecimento sem séries, confirmação e consulta sem iniciar passam nos testes.
- [x] Hoje/ontem podem ser alterados; todas as mutações fora dessa janela são rejeitadas antes do repositório.
- [x] Alterações diárias não reescrevem o template nem as definições históricas.
- [x] Versão 1.1.0 em inglês importada e ativada após autorização de commit em 27/09.

## Resultado

Correções de fluxo implementadas e submetidas à validação local. A conclusão
parcial não exige séries no aquecimento, mantém o estado dos switches e
normaliza valores numéricos vazios sem fabricar repetições realizadas.
O servidor impede mutações fora de hoje/ontem; a consulta continua independente
do início. Expansão e recolhimento ficam no título, sem botão duplicado.

A versão 1.1.0 da ficha foi criada sem alterar a versão 1.0.0. Nomes ingleses
usam o campo explícito `name_en` da biblioteca; `name_pt` e a coluna legada do
banco permanecem por compatibilidade. Importador e auditoria reconhecem o novo
campo. IDs, doses, ordem e blocos são preservados; comentários do usuário não
são traduzidos. Importação autorizada em 27/09 e condicionada à fonte commitada.

Navegação inferior somente com ícones permanece proposta não decidida em E06-T14.
Idiomas futuros confirmados: português, espanhol e inglês; sem implementação i18n.

Validação local: 272 testes unitários, 41 integrações PostgreSQL, tipos, lint,
estrutura, dados, formato, build e diff sem problemas. Conferidas respostas 200
para ontem e data futura; a data futura não expõe início de treino. Revisão
semântica preservou a fronteira de aplicação para a janela de mutação, o estado
local do rascunho e a distinção entre preparação sem séries e execução principal.

Revisão pré-PR corrigiu três inconsistências: a projeção preserva o estado
persistido do toggle independentemente das medidas das séries; a associação de
aquecimento reconhece Futevôlei e Footvolley sem alterar o nome informado pelo
usuário; a pausa de outra atividade não modifica rascunhos fora de hoje/ontem.
Rascunhos locais com JSON inválido não impedem o início de uma nova atividade.
A comparação de esportes fica em regra pura de domínio, sem dependência de UI
ou Prisma. Dados das séries, conclusão do exercício e conclusão da atividade
continuam sendo responsabilidades distintas.

Entrega local concluída em 27/09: fonte fbd544e importada e ativada na versão
1.1.0, com 34 definições de exercícios, 7 sessões e 42 prescrições novas.
Reimportação retornou no-op. Contagens e hashes de atribuições, atividades,
execuções e dados alimentares permaneceram idênticos antes/depois. Versões
anteriores e datas já materializadas não foram reescritas; reconciliação futura
permanece fora de escopo em E06-T13.

`pnpm run ci` aprovado integralmente: 272 testes unitários, 41 integrações,
33 regressões dos validadores, cobertura acima dos limites, tipos, formato,
lint, estrutura, schema, dados, build e auditoria sem vulnerabilidades conhecidas.
