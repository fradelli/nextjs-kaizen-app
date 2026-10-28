---
id: E10-T02
epic: E10
depends_on: [E10-T01]
---

# Player e registro de atividade em modal

## Objetivo

Trocar o botão largo de início e a avaliação inline por controles de execução no
cabeçalho e um modal de registro, com tempo ativo e rascunhos preservados. Ajustar
também a superfície e o contorno interativo das dicas de execução.

## Entradas

- `docs/implementation/TRAINING-ACTIVITY-PLAYER-AND-FEEDBACK-PLAN.md`
- `docs/implementation/FRADELLI-DESIGN-SYSTEM-ADOPTION-PLAN.md`
- `docs/implementation/ICONOGRAPHY-STANDARDIZATION-PLAN.md`
- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-controls/training-activity-controls.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.tsx`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.tsx`
- `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.ts`
- `src/features/training/domain/training-retrospective-record.rules.ts`
- `src/features/training/application/training-mutation.types.ts`
- `src/app/treino/training-actions.ts`
- `src/features/training/data/prisma-training-repository.ts`
- `tests/integration/training-mutations.test.ts`
- `tests/integration/fixtures/import-database.fixture.ts`
- `prisma/migrations/20261028010000_allow_short_training_activity_times/migration.sql`

## Decisões de entrada

- Concluir a E10-T01 com a versão publicada que contém catálogo e hover do DS.
- Orientação mais recente: treino guiado usa player; futevôlei/tipos externos abrem registro direto sem cronômetro.
- CheckCircle do Design System aprovado pelo usuário para finalização direta.
- Preservar a regra atual de Mobilidade (somente comentário); não ampliar campos sem decisão explícita.
- Aprovar o fluxo e a semântica de stop definidos no plano antes de implementar.

## Entregáveis

- Dicas nativas com superfície elevada e contorno arredondado em hover/foco.
- Play/Pausa/Stop no cabeçalho e layout responsivo com alvos de toque adequados.
- Um modal de registro por atividade, com footer externo e ação à direita.
- Captura consistente da pausa, cache da avaliação e recuperação em falhas.
- Servidor e regressões alinhados às decisões aprovadas, sem migration presumida.

## Critérios de aceite

- [x] Player representa os estados e mantém as transições aprovadas.
- [x] Stop abre o modal sem concluir automaticamente nem contar seu preenchimento como tempo ativo.
- [x] Salvar/erro/fechar/reabrir preservam avaliação, execução, foco e revisão.
- [x] Registro direto e correção de avaliação mantêm seus contratos próprios.
- [x] Dicas, cursor, hover, responsividade e acessibilidade passam no roteiro do plano.
- [x] Gates do consumidor e integrações descartáveis aprovados.

## Resultado

Implementado e validado em 28/10/2026: ícones do DS publicado, player guiado no
cabeçalho, registro externo direto e modal recuperável com proteção de envio/foco,
cache isolado e captura síncrona do stop. Mobilidade mantém somente comentário.
Dicas e botões seguem os estados compartilhados. A migration adicional corrige
horários reais curtos e a virada do dia sem fabricar duração.

Validação: 389 testes da aplicação, 53 integrações PostgreSQL, 41 testes dos scripts,
qualidade/tipos/build e auditoria aprovados. Chromium confirmou as jornadas, erro de
rede, recuperação/foco e larguras 320/390/768/1440px. Dispositivo físico segue na E06-T14.

Evidências e limites: [relatório da implementação](../../../docs/implementation/TRAINING-PLAYER-VALIDATION-2026-10-28.md).

## Achado confirmado no navegador

A constraint de minutos reais rejeitava execuções no mesmo minuto e na virada do dia.
A migration adicional valida a faixa do relógio sem inventar duração mínima; a ordem
cronológica continua protegida por timestamps, intervalos e validação do servidor.
