# Modais de atividades e rascunhos locais — guia de implementação

## 1. Estado e uso

- Base: commit `4af510c`, branch `codex/E06-T24-activity-preparation-and-rescheduling`.
- Repositório: `kaizen-app`. Planejamento de 27/10/2026.
- **Planejamento pronto para execução.** Este documento entrega contratos, algoritmos,
  alterações localizadas e testes; não é um conjunto de arquivos finais já testados
  para substituir por copiar/colar. Os blocos TypeScript são contratos completos.
- Documento original de planejamento. A implementação subsequente está registrada na seção 17; os ajustes comprovados ali prevalecem sobre decisões iniciais.
- A base E06-T24 ainda depende de validação PostgreSQL/navegador após recuperação do
  Docker. Os 337 testes de aplicação, 33 testes de scripts e build anteriores não
  validam os componentes planejados aqui, que ainda não existem.
- Preservar alterações posteriores à base e arquivos gerados como `next-env.d.ts`.
- Não inferir autorização de merge, deploy, novas dependências ou mudança de backend.

Ler tudo antes de editar. Seguir as etapas na ordem. Se a base mudou, comparar os
arquivos e preservar correções posteriores, sem copiar cegamente a versão antiga.

## 2. Escopo de produto aprovado

### Inclusão

O + abre diretamente **Adicionar atividade**, somente com o formulário. Não exibir
lista de treinos, accordion Adicionar, edição de existentes ou detalhes do plano.
O dia é o selecionado na página; informá-lo brevemente no cabeçalho, sem novo campo.

| Tipo | Campos visíveis, nesta ordem |
|---|---|
| Prática esportiva / Treino específico | Tipo de atividade, Nome, Esporte, Aquecimento, Início planejado, Fim planejado |
| Treino do plano | Tipo de atividade, Treino, Início planejado, Fim planejado; ajuda e ação Usar duração do treino quando aplicável |
| Mobilidade | Tipo de atividade, Nome, Início planejado, Fim planejado |

Preservar hidden inputs e campos condicionais atuais. Não remover Treino específico:
E06-T20 foi cancelada pelo usuário. Não adicionar data editável na inclusão.

### Edição

Lápis imediatamente antes da lixeira no card abre **Editar atividade**, só para aquele
treino. Deve funcionar com o card recolhido, sem expandir ou iniciar cronômetro.
Os campos são os da inclusão conforme o tipo, precedidos de **Data da atividade**.
Sem exercícios, avaliação, cronômetro, histórico ou outro treino dentro desse modal.

Preservar regras atuais: concluído não oferece edição; fora da janela de agenda não
há gestão; início persistido/local bloqueia remarcação e troca de aquecimento.
Não bloquear os ajustes de horário que o produto já permite em atividade iniciada.

### Rodapé

Rodapé separado da área de campos, sem card dentro de card:

- Inclusão: **Adicionar atividade**, ação principal à direita.
- Edição: **Excluir atividade** discreto/vermelho à esquerda; **Salvar alterações**
  principal/amarelo à direita, com distância confortável.
- Em 320 px/fonte ampliada, permitir duas linhas sem diminuir alvo de toque.
- Botões externos: `type="submit" form={formId}`. O rodapé fica fora do elemento
  form, além de fora da área dos campos. Não aninhar form de exclusão em edição.
- X no cabeçalho fecha. Não acrescentar botão Cancelar redundante.

## 3. Arquitetura escolhida

1. Reaproveitar TrainingActivityForm e Server Actions atuais. Sem duplicar domínio.
2. TrainingActivityEditor coordena gatilho, modal, rascunho e rodapé; atende novo/edit.
3. TrainingActivityModal usa `<dialog>` nativo, já presente na exclusão/finalização.
   Não instalar biblioteca nem inventar Dialog em `@fradelli/ui` (sem export local).
4. Hook atual useTrainingActionFeedback continua responsável por router.refresh.
   O editor só navega quando uma remarcação foi confirmada; sem refresh duplicado.
5. Namespace de formulário separado de execução. Nunca reutilizar
   `kaizen:training-draft:v1:...` nem alterar o cronômetro para implementar esse cache.
6. Só montar formulário/hook de persistência enquanto aberto e após a leitura inicial.
7. Remover drawer apenas depois que + e lápis estiverem ligados e testados.
8. Sem migrations, plano semanal, novas dependências ou alteração de ownership.

O P0 é público com workspace fixo e sem login. Evidência:
`docs/decisions/PUBLIC-SINGLE-WORKSPACE-MODE.md`. Não inventar usuário autenticado
nem expor PERSONAL_WORKSPACE_ID ao cliente para construir a chave de cache.

## 4. Layout e acessibilidade

- Desktop: centralizado, max-width 32rem; largura disponível menos 2rem.
- Celular: largura menos 1rem; max-height `calc(100dvh - 1rem)`, quase tela inteira.
- Três regiões: cabeçalho, corpo com `min-height:0; overflow-y:auto`, rodapé.
  Container com overflow hidden; inputs min-width 0; sem scroll horizontal.
- Rodapé considera `env(safe-area-inset-bottom)`; verificar teclado real. 100dvh
  sozinho não comprova compatibilidade com o teclado de todos os celulares.
- X e ícones têm alvo de toque mínimo 44x44 px.
- `showModal()`, não só atributo open: garantir foco modal e fundo inerte.
- IDs únicos com useId, aria-labelledby e aria-describedby.
- Foco inicial no título com tabIndex=-1, sem abrir teclado automaticamente.
- Fechar devolve foco ao gatilho; se sumiu após mover/excluir, focar título/data da
  página, sem focus em elemento desconectado.
- X, Esc e backdrop passam pela mesma função requestClose. Nunca method=dialog no X.
- Clique nos campos/padding não fecha. Backdrop só fecha se a interação começou e
  terminou fora do conteúdo; target===dialog sozinho pode incluir padding.
- Bloquear scroll de fundo e restaurar valor anterior, respeitando dialog de exclusão.
- Erros role=alert, visíveis e alcançáveis; status de cache role=status sem anunciar
  cada tecla. Tokens de cor atuais, sem criar tema novo.
- Lápis usa SVG local aria-hidden e botão aria-label="Editar atividade: NOME".
  `@fradelli/ui/icons` instalado evidencia somente BarbellIcon e ForkKnifeIcon;
  não inventar PencilIcon nem importar pacote transitivo.

## 5. Chaves, contexto e conteúdo do cache

Prefixo: `kaizen:training-activity-editor:v1:public-fixed-workspace:`.
Inclusão: `${prefix}new:${civilDate}`. Edição: `${prefix}edit:${activity.id}`.
A data não entra na chave da edição: atividade movida mantém ID; a origem fica no
contexto para detectar mudança. Um rascunho novo por dia, sem criar ID de atividade.
localStorage é isolado por origem (protocolo/domínio/porta). Escopo estático do P0
não é autenticação. Se houver login ou troca de workspace na mesma origem, revisar
namespace antes de liberar essa mudança. Sem promessa de sincronizar dispositivos.

### Contrato completo do arquivo de tipos

Criar em `src/features/training/ui/lib/training-activity-editor-draft/training-activity-editor-draft.types.ts`:

```ts
import type { TrainingActivityType } from "@/features/training/domain/training-day.types";

export type TrainingActivityEditorValues = Readonly<{
  type: TrainingActivityType;
  name: string;
  sport: string;
  sessionId: string;
  preparationChoice: string | null;
  targetCivilDate: string;
  plannedStartTime: string;
  manualEndTime: string;
  automaticEnd: boolean;
}>;

export type TrainingActivityEditorContext = Readonly<{
  scope: "public-fixed-workspace";
  mode: "new" | "edit";
  sourceCivilDate: string;
  activityId: string | null;
  baseRevision: number | null;
  baseFingerprint: string;
  planFingerprint: string;
}>;

export type TrainingActivityEditorDraft = Readonly<{
  version: 1;
  context: TrainingActivityEditorContext;
  values: TrainingActivityEditorValues;
  writerId: string;
  writeId: string;
  updatedAt: string;
  expiresAt: string;
}>;

export type TrainingActivityEditorDraftStatus =
  | "loading" | "clean" | "dirty" | "stored" | "restored"
  | "storage_error" | "stale" | "external_change" | "expired" | "invalid";

export type TrainingActivityEditorStorageResult =
  | Readonly<{ status: "ok" }>
  | Readonly<{ status: "failed" }>;
```

Não cachear FormData, funções, erro de servidor, prescrições, DTO inteiro ou cronômetro.
expectedRevision não pertence a values: vem do DTO atual e do contexto de abertura.

### 5.1 Significado, população e limites

| Campo | Regra de população e motivo | Controle |
|---|---|---|
| type | Seletor atual, enum de domínio | Rejeitar tipo desconhecido |
| name / sport | Texto literal, inclusive incompleto | Máximo 120 / 80 caracteres |
| sessionId | Sessão principal escolhida | Precisa continuar disponível/histórica permitida |
| preparationChoice | null=sugestão; keep=manter edição; automatic/none/ID público=escolha explícita | keep proibido no novo; ID só preparação válida |
| targetCivilDate | Data da edição; origem no novo | Vazio pode ser rascunho; janela validada ao salvar |
| plannedStartTime | Valor literal do input | Vazio permitido no cache |
| manualEndTime | Valor interno manual, não o fim calculado exibido | Preserva a intenção de horário |
| automaticEnd | Modo atual do cálculo | Restaurar junto dos horários |
| sourceCivilDate | Dia servido ao abrir | Não substituir pelo destino antes de saved |
| activityId | ID real do DTO; null no novo | Comparar com contexto; não escolher ownership pelo cache |
| baseRevision | Revisão do DTO da abertura; null no novo | Nunca atualizar silenciosamente em conflito |
| baseFingerprint | Serialização estável da base relevante | Detectar mudança além da revisão do pai |
| planFingerprint | Identidade/versão/opções do plano público | Não substituir opção que sumiu |
| writerId | UUID gerado por montagem do editor | Detectar outra aba; não representa usuário |
| writeId | Novo UUID por escrita | Detectar que o registro mudou |
| updatedAt / expiresAt | ISO UTC do navegador | Retenção local, não autorização de data |

baseFingerprint = JSON.stringify de uma tupla de ordem fixa: ID, origem, revisão,
tipo, nome, esporte, início/fim planejados, status, startedAt/completedAt, IDs públicos
de sessão principal e preparação nomeada, preparações filhas ordenadas por ID com
ID/revisão/status/startedAt/completedAt. Não incluir tempo ativo/tick de cronômetro.

planFingerprint = tupla planId/version/opções de sessões ordenadas por sessionId,
incluindo assignmentRole/targetDurationMinutes, mais associações de esporte ordenadas.
Plano ausente: literal unavailable. Não guardar prescrições para calcular fingerprint.

Schema Zod em arquivo próprio, objetos strict, enum atual, campos limitados e coerência
mode/ID/revisão. Até 32 KiB de JSON antes de parsear; IDs até 200 caracteres e
fingerprints até 8192. Horário vazio ou HH:mm (até 5); input data vazio ou yyyy-mm-dd
(até 10). Metadados têm datas ISO finitas, ordered updatedAt<=expiresAt e revisão
inteira não negativa. Incompleto é rascunho válido, não submissão válida.

Retenção: 7 dias desde última alteração do usuário, sem renovar por simples abertura.
Expirado não restaura automaticamente: avisar e oferecer recomeçar. Estar fora da
janela de agenda não autoriza salvar e não provoca exclusão silenciosa do cache.
JSON inválido/versão desconhecida não causa crash nem entra nos inputs. Só remover
registro inválido em uso por descarte explícito. Não varrer outros namespaces.

## 6. Hook: API e algoritmo

Arquivo de contrato completo:
`src/features/training/ui/hooks/use-training-activity-editor-draft/use-training-activity-editor-draft.types.ts`:

```ts
import type {
  TrainingActivityEditorContext,
  TrainingActivityEditorDraftStatus,
  TrainingActivityEditorStorageResult,
  TrainingActivityEditorValues,
} from "../../lib/training-activity-editor-draft/training-activity-editor-draft.types";

export type UseTrainingActivityEditorDraftInput = Readonly<{
  context: TrainingActivityEditorContext;
  baseValues: TrainingActivityEditorValues;
}>;

export type UseTrainingActivityEditorDraftResult = Readonly<{
  ready: boolean;
  initialValues: TrainingActivityEditorValues;
  status: TrainingActivityEditorDraftStatus;
  dirty: boolean;
  blocked: boolean;
  update: (values: TrainingActivityEditorValues) => void;
  flush: () => TrainingActivityEditorStorageResult;
  discard: () => TrainingActivityEditorStorageResult;
  finish: () => TrainingActivityEditorStorageResult;
}>;
```

O parser deve exportar resultado discriminado em `training-activity-editor-draft.types.ts`:

```ts
export type TrainingActivityEditorReadResult =
  | Readonly<{ status: "missing" }>
  | Readonly<{ status: "restored"; draft: TrainingActivityEditorDraft }>
  | Readonly<{
      status: "stale";
      draft: TrainingActivityEditorDraft;
      reason: "context_changed" | "base_changed" | "plan_changed";
    }>
  | Readonly<{ status: "expired" }>
  | Readonly<{ status: "invalid" }>;
```

`parseActivityEditorDraft` aceita raw:string|null. null retorna missing. Structuralmente
válido mas incompatível retorna stale; JSON inválido nunca fornece values. A UI usa
baseline em invalid/expired, com aviso e bloqueio até descarte explícito ou saída,
sem sobrepor o registro problemático durante autosave. Remoção em outra aba é evento
de conflito, não missing da abertura inicial.

### 6.1 Leitura inicial

1. Capturar contexto e baseline uma vez por abertura; não refazer a cada render.
2. Ler localStorage em effect cliente; antes de ready não montar formulário.
3. Sem cache: initialValues=baseline, clean.
4. Válido/compatível: initialValues=values recuperados, restored. Não escrever só por ler.
5. Base/revisão/data/filhos/plano mudaram: stale, envio bloqueado. Mostrar aviso e
   preenchimento antigo somente para consulta. **Descartar rascunho e carregar dados
   atuais** é ação explícita. Não fazer merge ou atualizar revisão automaticamente.
6. Opção removida do plano nunca vira primeira opção silenciosamente.
7. Storage indisponível: permitir preencher em memória, avisando a limitação; fechar
   com dirty exige escolha explícita. O formulário não pode ficar inutilizável.
8. Descarte remonta formulário por uma chave incremental local, não por cada tecla.

### 6.2 Escrita

- Comparação determinística inclui todos os nove campos de values, inclusive campos
  temporariamente ocultos e modo manual/automático. Voltar ao baseline torna clean.
- update atualiza uma ref imediatamente e agenda debounce de **400 ms**.
- Não serializar só FormData: disabled/hidden não representam todos os estados.
- Antes de escrever, conferir writeId armazenado contra último conhecido.
- Sucesso: memorizar writeId e mostrar **Rascunho salvo neste navegador**.
- Clean: remover somente a chave atual própria, respeitando writeId remoto.
- Erros get/set/remove viram storage_error, sem lançar para React.
- flush cancela debounce, usa ref mais recente e retorna ok/failed sincronamente.
- visibilitychange para hidden e pagehide tentam flush sem await. Não depender só
  de cleanup/unmount, nem enviar rascunho ao servidor por sendBeacon.
- beforeunload só avisa se houver dirty não guardado por falha; não quando já guardado.
- Cleanup remove listeners/timers. Depois de finish/descarte não pode gravar snapshot
  antigo. Strict Mode não pode duplicar timers nem apagar o que acabou de recuperar.

### 6.3 Duas abas e conflitos

storage event da chave atual com writeId diferente pausa autosave, external_change.
Remoção remota também sinaliza: outra aba pode ter acabado de salvar. Preservar os
valores locais em memória; não sobrescrever nem apagar o registro remoto.
Mensagem: **Este rascunho mudou em outra aba. Reabra o editor para conferir os dados.**
Fechar nesse estado exige aviso se memória não guardada; não anunciar salvamento local.

localStorage não tem compare-and-swap transacional: checar writeId reduz colisão,
mas não garante lock entre escritas exatamente simultâneas. Não prometer exclusão
mútua perfeita. Revisão no servidor protege edição; sem mecanismo distribuído novo.

### 6.4 discard e finish

- discard é ação do usuário: remove somente versão conhecida e volta ao baseline
  atual por remontagem. Falha mostra aviso e conserva o estado até escolha explícita.
- finish ocorre só após saved: primeiro desabilita escritas/timers, depois tenta remover
  a chave própria. Não persistir o reset do formulário nem ressuscitar no cleanup.
- Chave mudou em outra aba? Não remover; novo DTO fará o cache velho ficar stale.
- Falha de limpeza após servidor confirmar sucesso não pode gerar reenvio ou mensagem
  de falha do servidor. Fechar com aviso na página. Nunca recuperar enviando automaticamente.

## 7. Máquina de estados e proteção de saída

| Estado | Campos | Salvar | Fechar | Excluir |
|---|---|---|---|---|
| opening | Não montados | Bloqueado | Permitido | Indisponível |
| editing | Conforme regras | Permitido sem bloqueio | flush | Permitido |
| stale/external_change | Consulta e aviso | Bloqueado | Aviso se memória não guardada | Bloqueado até conferir base |
| saving | Desabilitados | Bloqueado | Bloqueado | Bloqueado |
| confirming_delete | Pai inerte | Bloqueado | Só cancelar confirmação | Confirmar/manter |
| deleting | Desabilitados | Bloqueado | Bloqueado inclusive Esc | Bloqueado |
| close_storage_error | Aviso no modal | Sem envio incidental | Tentar guardar/Fechar sem guardar | Sem exclusão incidental |
| saved/deleted | Desmontando | Bloqueado | Programático | Bloqueado |

busyRef é a autoridade síncrona para saída. No submit válido, marcar busy no mesmo
evento, antes da action. Não confiar só em pending de render anterior. Se validação
local impedir envio, busy não pode ficar preso.

requestClose: busy/confirmação ativa => não fechar; clean => fechar; dirty => flush.
Se ok, fechar mantendo cache. Se failed, manter modal com **Tentar guardar novamente**
e **Fechar sem guardar**, esta última saída explícita. Estado fica no mesmo modal,
sem mais um dialog. Não confirmar descarte toda vez se cache já está guardado.

Envio: validar HTML + intervalo atual + verificação de execução local da E06-T24;
conferir opções restauradas; tentar flush sem impedir save servidor por falha do cache;
marcar busy; enviar uma vez; sempre soltar busy no finally.

Resultado não saved conserva valores e cache. conflict/not_found exige conferir base
atual antes de tentar outra vez, sem atualizar expectedRevision silenciosamente.
pending_confirmation não fecha. saved chama finish, fecha, deixa refresh no hook atual
e faz um push ao destino somente quando a data foi alterada.

Exceção de transporte pode ocorrer depois de gravação. Inclusão atual não tem chave
de idempotência nem devolve ID. Não prometer criação única com resposta incerta.
Não repetir automaticamente. Mensagem: **Não foi possível confirmar o salvamento.
Confira a agenda antes de tentar novamente.** Oferecer recarregar a agenda, guardando
rascunho. Idempotência forte seria outra tarefa de backend, fora deste escopo.

## 8. Inventário e ordem de aplicação

Caminhos exatos relativos à raiz do repositório. Dependências crescem na ordem abaixo.
Uma pasta de componente só contém arquivos do seu prefixo; hooks/helpers em pastas próprias.

| Ordem | Ação | Arquivo | Finalidade |
|---|---|---|---|
| 1 | Criar | `src/features/training/ui/lib/training-activity-editor-draft/training-activity-editor-draft.types.ts` | Contratos da seção 5 |
| 2 | Criar | `src/features/training/ui/lib/training-activity-editor-draft/training-activity-editor-draft.schema.ts` | Zod estrito e validação estrutural |
| 3 | Criar | `src/features/training/ui/lib/training-activity-editor-draft/training-activity-editor-draft.utils.ts` | Chaves, baseline, fingerprint e parse |
| 4 | Criar | `src/features/training/ui/lib/training-activity-editor-draft/training-activity-editor-draft.test.ts` | Testes puros |
| 5 | Criar | `src/features/training/ui/hooks/use-training-activity-editor-draft/use-training-activity-editor-draft.types.ts` | Contrato da seção 6 |
| 6 | Criar | `src/features/training/ui/hooks/use-training-activity-editor-draft/use-training-activity-editor-draft.ts` | Hook de cache e listeners |
| 7 | Criar | `src/features/training/ui/hooks/use-training-activity-editor-draft/use-training-activity-editor-draft.test.tsx` | Debounce, falhas e concorrência |
| 8 | Criar | `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.types.ts` | Props de apresentação |
| 9 | Criar | `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.styles.ts` | Layout de três regiões |
| 10 | Criar | `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.tsx` | Dialog, foco e fechamento |
| 11 | Criar | `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.test.tsx` | Busy, Esc e backdrop |
| 12 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.types.ts` | Ponte opcional com o editor |
| 13 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-form/hooks/use-training-activity-schedule.ts` | Inicialização de horários recuperados |
| 14 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.tsx` | Recuperação e envio coordenado |
| 14.1 | Editar | `src/features/training/ui/hooks/use-training-action-feedback.ts` | Refresh opcional para coordenar conclusão antes de remover o card |
| 14.2 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-form/components/training-preparation-select/training-preparation-select.tsx` | Exibir opção indisponível sem selecionar outra silenciosamente |
| 15 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.styles.ts` | Espaçamento dos campos |
| 16 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.test.tsx` | Regressões e modo externo |
| 17 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.types.ts` | Callbacks e bloqueio externo |
| 18 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.tsx` | Confirmação segura e limpeza pontual |
| 19 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.test.tsx` | Falha, pendência e sucesso |
| 20 | Criar | `src/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor.types.ts` | Props novo/editar e execução local |
| 21 | Criar | `src/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor.tsx` | Orquestração do editor e rodapé |
| 21.1 | Criar | `src/features/training/ui/components/training-day-page/components/training-activity-editor-content/training-activity-editor-content.types.ts` | Props do conteúdo aberto |
| 21.2 | Criar | `src/features/training/ui/components/training-day-page/components/training-activity-editor-content/training-activity-editor-content.tsx` | Montagem isolada dos hooks |
| 22 | Criar | `src/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor.test.tsx` | Fluxos completos |
| 22.1 | Criar | `src/features/training/ui/components/training-day-page/components/training-activity-editor-notice/training-activity-editor-notice.tsx` | Aviso persistente na página |
| 22.2 | Criar | `src/features/training/ui/components/training-day-page/components/training-activity-editor-notice/training-activity-editor-notice.types.ts` | Contrato do aviso |
| 23 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.types.ts` | Plano público para edição |
| 24 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.tsx` | Lápis ao lado da lixeira |
| 25 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.test.tsx` | Edição contextual sem expandir |
| 26 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-section/training-activity-section.types.ts` | Prop de plano público |
| 27 | Editar | `src/features/training/ui/components/training-day-page/components/training-activity-section/training-activity-section.tsx` | Propagar plano aos cards |
| 28 | Editar | `src/features/training/ui/components/training-day-page/components/training-day-content/training-day-content.tsx` | Extrair plano das variantes do DTO |
| 29 | Editar | `src/features/training/ui/components/training-day-page/components/training-agenda-badges/training-agenda-badges.tsx` | Detalhes do plano fora do modal |
| 30 | Editar | `src/app/treino/page.tsx` | Substituir controle do + |
| 31 | Remover | `src/features/training/ui/components/training-day-page/components/training-agenda-drawer/training-agenda-drawer.tsx` | Drawer substituído |
| 32 | Remover | `src/features/training/ui/components/training-day-page/components/training-agenda-drawer/training-agenda-drawer.types.ts` | Drawer substituído |
| 33 | Remover | `src/features/training/ui/components/training-day-page/components/training-agenda-drawer/training-agenda-drawer.styles.ts` | Drawer substituído |

## 9. Alterações localizadas, dependências e verificação por arquivo

### 9.1 Contratos, schema e utils — 1 a 4

Problema: há rascunho de execução, mas nenhum para o formulário. Criar o contrato da
seção 5, parser Zod e helpers puros, sem acesso ao banco ou import server-only.

Exports de utils, implementados integralmente conforme seção 5:

- activityEditorDraftKey(context): chave exata, sem data na edição.
- initialActivityEditorValues(civilDate, activity, availablePlan): baseline equivalente
  ao formulário atual. Edit: textos/horários atuais, keep e automaticEnd=false. Novo:
  sport_practice, textos/horários vazios, preparationChoice=null, automaticEnd=true.
  Sessão inicial histórica ou primeira sessão main do plano; destino inicial=origem.
- activityEditorContext(civilDate, activity, availablePlan): metadados exclusivamente
  dos DTOs; null para ID/revisão no novo, fingerprints com ordem definida.
- sameActivityEditorValues(a,b): compara os nove campos; não JSON de objeto arbitrário.
- parseActivityEditorDraft(raw, context, now): resultado discriminado de leitura;
  não usa window/localStorage; aplica tamanho, schema, expiração e contexto.
- createActivityEditorDraft(context,values,writerId,now): envelope com writeId novo,
  expiração e relógio recebido para testes; UUID é gerado somente no cliente.
- removeActivityEditorDraft(activityId): limpeza pontual do cache de edição para
  lixeira externa; falha não quebra exclusão que servidor já confirmou.

Verificação: strings vazias, none/keep/automatic, enum inválido, JSON quebrado, versão
estranha, outro ID/dia/escopo, mudança de revisão/filho/plano, expiração e horário manual.
Não mockar a implementação para fazer esses testes passarem.

### 9.2 Hook — 5 a 7

Problema: desmontar perde preenchimento. Implementar a API da seção 6 e seu algoritmo.
Dependências: contratos/schema/utils, sem Server Action. Storage testável por spies.
Conferir ready antes do form, 400 ms, flush, erro get/set/remove, duas abas, limpeza
após saved e Strict Mode. Não escrever cache durante render. Não manter timer órfão.

### 9.3 Modal — 8 a 11

Problema: drawer mistura operações; dialog não deve conhecer treino ou cache.
Props em types: title, description, children (corpo), footer, busy e onRequestClose.
Adicionar referência opcional ao gatilho para restaurar foco. Classes em styles.

Montado somente aberto. useId para IDs; showModal em effect com guarda !dialog.open.
onCancel sempre preventDefault e chama a saída autorizada se não busy. X nunca tem
method=dialog. Apenas o fluxo autorizado fecha/desmonta. Sem lógica de cache aqui.
Verificar apresentação, bloqueio de saída e semântica em testes; foco/inert/scroll
nativos exigem navegador, porque jsdom não os implementa completamente.

### 9.4 Form e cálculo de horário — 12 a 16

Problema: form controla tudo internamente, renderiza botão e navega diretamente.
Adicionar `editor` opcional ao TrainingActivityFormProps, com o contrato abaixo.
Sem editor, preservar o modo atual para não quebrar testes/reuso durante integração.

- formId: string, ID único liga submit externo ao form.
- initialValues: TrainingActivityEditorValues, aplicado uma vez ao montar.
- blocked: boolean, impede submissão por conflito/cache/opção inválida.
- readOnly: boolean, consulta de rascunho stale, sem mutação.
- onValuesChange(values): publica snapshot completo após mudança; callback estável.
- onBusyChange(busy): busy síncrono em submit válido e liberação ao terminar.
- onSaved({targetCivilDate}): só após status saved; pai limpa cache e navega.

Com editor, não renderizar botão interno, não fazer push direto e não resetar campos
antes de finish no pai. Mensagens de erro continuam no form, não somem ao fechar falha.

useTrainingActivitySchedule: receber initialValues opcional sem perder originalSession;
inicializar type/sessionId/startTime/manualEnd/automatic do snapshot. Expor manualEnd
além de endTime: guardar apenas o fim calculado destruiria o modo automático.
Adicionar também `startedLocally?: boolean` ao tipo de props do form e combinar esse
flag no cálculo de notStarted para data/aquecimento, sem bloquear os horários permitidos.
Manter changeType/changeEnd/enableAutomatic/acceptSaved/expectedRevision e regra de
sessão histórica. Revisão vem do DTO, nunca do rascunho. Recuperação é inicialização
atômica por montagem, não cascata de effects chamando setters de cada campo.

TrainingActivityForm: targetDate/name/sport/preparationChoice usam initialValues.
Publicar snapshot completo em effect com comparação/ref para evitar loop por objeto
novo. Não chamar setState do pai durante render. IDs do form vêm de formId quando editor.
Fim automático continua reagindo ao início/sessão; manual permanece; Usar duração
altera automaticEnd e deve ser persistido. preparationChoice=null mantém sugestão por
esporte; none/automatic/ID explícitos não mudam só porque esporte mudou.

Keep só vale editando o tipo original; o valor efetivo calculado da sugestão não vira
escolha manual no cache. Campos condicionais mantêm memória, mas hidden inputs da
submissão continuam os adequados para o tipo. Não enviar dados incompatíveis do cache.

onSubmit verifica blocked/readOnly, intervalo e rascunho de execução existentes antes
de marcar busy. preventDefault local não prende busy. Fieldset disabled durante envio
ou readOnly. Botão externo com form=ID e Enter enviam o mesmo form uma única vez.
Exceção segue a mensagem de incerteza da seção 7, com finally para soltar busy.
Não duplicar refresh do hook atual.

Verificação específica: regressões atuais mais snapshot manual/automático, opção
recuperada ausente, revisão correta, submit externo, erro sem reset e onSaved único.

### 9.5 Exclusão — 17 a 19

Problema: confirmação atual pode fechar com Esc durante envio, não conversa com modal
pai e não limpa novo cache. Adicionar props opcionais disabled, onBusyChange e
onConfirmationChange. Manter action/revisão reais do DTO.

- Não compact: rótulo Excluir atividade. Compact: ícone externo atual.
- Confirmação menciona nome/data. Manter atividade cancela sem perder form de edição.
- Submit marca busy imediatamente. Erro mantém confirmação e rascunhos; finally libera.
- Bloquear Manter/Esc/novo envio durante exclusão. Pai bloqueia salvar enquanto a
  confirmação estiver aberta, além de bloquear enquanto delete está pendente.
- IDs de dialog com useId: lixeira no card e no modal coexistem para o mesmo ID.
- saved limpa rascunho de execução como hoje, mais o novo cache desse ID; onDeleted
  uma vez, fecha confirmação/modal. Evitar effect repetido por callback instável.
- Falha de limpeza local após sucesso gera aviso; não repetir exclusão.
- Nunca aninhar form de exclusão no de edição.

Verificação: cancelar, rejeição/conflict, exclusão externa e no rodapé, Esc e Manter
bloqueados durante pendência, cleanup somente após saved, IDs únicos.

### 9.6 Editor — 20 a 22

Props: civilDate, availablePlan, actions e activity opcional. Ausência de activity
significa novo; não criar mode que possa contradizer activity. Aceitar também um
flag opcional startedLocally, fornecido pelo card, para bloquear data/aquecimento.
Não alterar o hook de execução para obter esse sinal.

TrainingActivityEditor renderiza gatilho e controla open. Para não violar regras de
hooks nem montar cache fechado, criar conteúdo aberto em componente próprio:

- **21.1 Criar** `src/features/training/ui/components/training-day-page/components/training-activity-editor-content/training-activity-editor-content.types.ts`.
- **21.2 Criar** `src/features/training/ui/components/training-day-page/components/training-activity-editor-content/training-activity-editor-content.tsx`.

Estes dois arquivos estão incluídos no inventário da seção 8. Props do
conteúdo: os dados do editor, referência ao gatilho e onClose; sem open redundante.
O conteúdo monta hook, modal e form. O wrapper nunca chama hook condicionalmente.
Reutilizar estilos do modal; só criar styles do editor se houver estilo adicional real.

No conteúdo: formId de useId; contexto/baseline da abertura; aguardar draft.ready;
avisos separados da área dos campos, sem inventar novos inputs. Descarte remonta form.
Controlar busyKind=null/save/delete e confirmationOpen; ref síncrona espelha busy.
blocked deriva também de cache stale/opções inválidas. Salvar não pode correr junto
com excluir. Footers têm botões de envio externos e delete não compact na edição.

onSaved: bloquear novas escritas, finish, fechar, navegar só se destino mudou. Refresh
continua no hook existente. onDeleted: limpar, fechar, devolver foco para página se
card sumiu. Não repetir navigation/callback em effect por dependência instável.

Se o DTO mudar com o editor aberto, comparar fingerprints antes de salvar; marcar
stale mantendo memória. Não continuar usando revisão antiga como se tela fosse atual.
Reabrir monta com DTO/cache atuais. Nenhum cache pode substituir o DTO do servidor.
Ao descartar um rascunho stale por atualização externa, recarregar primeiro os dados
atuais e só então montar o baseline. Não apenas incrementar a key usando o DTO antigo.
Se a atividade foi removida, fechar e informar que ela não existe mais; não recriar.

Aviso raro de falha de limpeza após sucesso precisa sobreviver ao fechamento/card
excluído. Para resolver sem alert nativo ou dependência, acrescentar:

- **22.1 Criar** `src/features/training/ui/components/training-day-page/components/training-activity-editor-notice/training-activity-editor-notice.tsx`.
- **22.2 Criar** `src/features/training/ui/components/training-day-page/components/training-activity-editor-notice/training-activity-editor-notice.types.ts`.

É um pequeno componente cliente, montado uma vez na área summary da página. Ouve
CustomEvent de nome literal `kaizen:training-activity-editor-notice`, com detail
`{ message: string }`; valida tipo/limite antes de mostrar texto como role=status.
Botão Fechar limpa aviso. Listener removido no cleanup; nunca renderizar HTML recebido.
Editor e lixeira emitem esse evento somente em sucesso com falha de limpeza local.
Mensagem: **A alteração foi salva. Não foi possível limpar o rascunho deste navegador.**
Não registrar dados do formulário em console. Evento não leva ID, plano ou dados pessoais.
O wrapper pode emitir antes de fechar; o notice fica fora dos cards/modais e continua
montado no refresh. Esses dois arquivos estão incluídos no inventário obrigatório.

Verificar abertura isolada, edição de dois IDs, cache quebrado, sucesso/erro, ausência
de hooks condicionais, aviso pós-fechamento e desmontagem sem escrita residual.
Testes do notice podem ficar no teste integrado do editor, importando o componente.

### 9.7 Plano público e lápis — 23 a 28

O card hoje não recebe availablePlan. Propagar sem fetch no modal:
`TrainingDayContent → TrainingActivitySection → TrainingActivityCard → Editor`.
Adicionar `availablePlan?: AvailablePublicTrainingPlanDto | null` aos tipos de card e
section; defaults null preservam chamadas antigas. Em TrainingDayContent passar
`"availablePlan" in day ? day.availablePlan : null`; o DTO tem variantes sem esse campo.

No card, dentro de tools e imediatamente antes da lixeira, renderizar editor quando
`status !== "completed" && agendaEditable`. Passar activity, civilDate, plano, actions
e startedLocally=Boolean(activeDraft). Este flag bloqueia data/aquecimento desde a
abertura, somado à verificação atual de localStorage no submit e à proteção do servidor.

Lixeira externa mantém onDeleted=execution.clear e agrega limpeza pontual do cache
novo; não limpar execução por só abrir/fechar editor. Pausar/retomar/expandir/registrar
retrospectivo/finalizar não mudam. Não trocar a semântica de status local pelo DTO antigo.
A lixeira externa e a interna compartilham a limpeza; torná-la idempotente para que
callbacks não apaguem o rascunho remoto de outra aba.

Testes de card atuais mockam useRouter com refresh somente. Atualizar mocks afetados
para push sem enfraquecer as asserções atuais. Verificar lápis sem expandir, IDs do
editor correto e nenhuma interferência com cronômetro/drafts de execução.

### 9.8 Página, plano e remoção — 29 a 33

TrainingAgendaBadges mantém badges atuais e acrescenta um details separado no resumo
para dados públicos de plano, usando `"planId" in day`. Conteúdo igual ao drawer antigo:
planId e planVersion públicos; sem IDs de banco. Nunca dentro dos modais de atividades.

Em page.tsx trocar import de TrainingAgendaDrawer por TrainingActivityEditor. controls
renderiza editor sem activity, com civilDate/plano/actions quando day existe. O próprio
editor conserva o gate de data editável. Preservar redirect, datas inválidas e estados
de erro. Em summary incluir badges e o notice da seção 9.6, com apenas uma instância.

Remover os três arquivos antigos do drawer ao fim. `rg TrainingAgendaDrawer src` não
pode mostrar uso ativo. Ajustar testes que procuram Gerenciar atividades do dia: novo
label do + é Adicionar atividade. Não falsificar evidência antiga: harnesses locais
em .git são históricos, não provas do fluxo novo sem execução real.

## 10. Etapas e gates

| Etapa | Arquivos | Condição para continuar |
|---|---|---|
| A | 1 a 4 | Contratos, chaves, parser/fingerprints passam sem React |
| B | 5 a 7 | Hook passa debounce/flush/falha/conflitos/Strict Mode |
| C | 8 a 11 | Modal passa semântica, Esc/backdrop/busy |
| D | 12 a 16 | Todos os testes anteriores de form continuam passando |
| E | 17 a 22, incluindo complementos 21.1/21.2/22.1/22.2 | Editor, exclusão, notices e rodapé passam |
| F | 23 a 30 | Página conectada aos novos controles, sem fetch novo |
| G | 31 a 33 | Sem drawer/import órfão e detalhes preservados |
| H | Regressão e navegador | Matriz de aceite registrada com evidências reais |

Commits por conjunto compilável; não commitar etapa quebrada. Não concluir apenas
porque typecheck passou. Não criar um branch name com ID de roadmap inexistente:
consultar o roadmap ao iniciar e registrar a tarefa conforme a convenção vigente.

## 11. Matriz obrigatória de testes

| ID | Cenário | Resultado |
|---|---|---|
| U01 | Novo no dia A e dia B | Rascunhos separados |
| U02 | Edição de dois IDs | Dados nunca se misturam |
| U03 | Atividade mudou de dia | Mesma chave por ID; contexto antigo stale |
| U04 | Fechar antes de 400ms | Último caractere recuperado |
| U05 | Fechar sem alterar | Nenhum rascunho vazio |
| U06 | Reload | Campos e modos de fim/aquecimento recuperados |
| U07 | DTO com revisão nova | Aviso e bloqueio; sem troca silenciosa de revisão |
| U08 | Filho mudou, pai igual | Fingerprint detecta |
| U09 | Sessão/plano sumiu | Não selecionar outra opção automaticamente |
| U10 | Recuperar fim manual, mudar início | Fim preservado |
| U11 | Recuperar automático, mudar início | Fim recalcula |
| U12 | Recuperar none e editar horário | Não cria aquecimento |
| U13 | Escolha manual de aquecimento, mudar esporte | Escolha preservada |
| U14 | JSON/versão/tamanho inválidos | Sem crash nem aplicação em inputs |
| U15 | get/set falham | Preencher permitido; fechar com dirty exige saída explícita |
| U16 | remove falha após saved | Aviso na página, sem reenviar mutação |
| U17 | Outra aba escreve/remove | Autosave pausa, não apaga registro remoto |
| U18 | Strict Mode e desmontagem | Sem timers/escritas indevidas |
| U19 | Promise pendente, X/Esc/backdrop/Enter | Uma action, modal fica, botões bloqueados |
| U20 | invalid/conflict/not_found/exceção | Conserva campos e cache, sem fechar |
| U21 | saved sem mover | Limpa só próprio rascunho, fecha uma vez |
| U22 | saved remarcando | Um push ao destino; nenhum push no erro |
| U23 | Cancelar excluir | Preserva treino e edição |
| U24 | Excluir pendente e Esc/Manter/Salvar | Nenhuma operação concorrente |
| U25 | Excluir salvo/falha | Limpa ambos rascunhos somente após sucesso |
| U26 | Remarcar com execução local | Bloqueia sem limpar execução |
| U27 | Lápis com card fechado | Só editor escolhido; não expande/inicia |
| U28 | Enter e submit externo | Mesmo form, sem enviar exclusão |
| U29 | Tipo específico e plano ausente | Tipo preservado, opções respeitam disponibilidade |
| U30 | Drawer removido | + não lista existentes ou detalhes de plano |
| U31 | Voltar tudo ao baseline | Clean e remoção da própria chave |
| U32 | Expiração/virada do dia/campos vazios | Retenção não autoriza agenda |
| U33 | finish e cleanup | Rascunho não ressuscita |
| U34 | Duas lixeiras do mesmo card | IDs únicos e só confirmação acionada aberta |
| U35 | DTO muda durante edição | Memória preservada, blocked até conferir |

Fake timers só em debounce, avançados dentro de act. Restaurar relógio/listeners/
storage no cleanup. Promises controladas verificam pendência antes de resolver.
Não usar sleeps arbitrários. Dialog mockado no jsdom não prova foco/teclado real.

## 12. Roteiro de navegador

Usar banco descartável com plano importado, nunca dados pessoais para testar mutações.

1. Em 390x844, + abre só formulário da inclusão, conforme tipo.
2. Digitar atividade incompleta, fechar X e reabrir; recuperar último caractere.
3. Repetir Esc/backdrop no desktop; clicar conteúdo/padding não fecha.
4. Futevôlei sugere aquecimento; escolher none, informar horários e adicionar. Um card,
   modal fechado, novo + limpo.
5. Lápis desse card, mudar horário, fechar/reload/reabrir. None preservado; salvar atualiza.
6. Remarcar e verificar destino, mesmo ID/horários/aquecimento, origem sem recriação,
   atividades previstas no destino preservadas.
7. Treino do plano: fim automático e manual recuperam o modo correto; Usar duração
   continua funcionando. Não regredir E06-T19.
8. Duas abas no mesmo treino: cache e servidor detectam conflito sem substituição muda.
9. Offline no envio: mantém valores e informa incerteza; reconectar não repete mutação.
10. Excluir no rodapé: cancelar conserva; confirmar remove card e caches correspondentes.
    Lixeira externa tem o mesmo efeito e mantém confirmação.
11. Tab/Shift+Tab/Esc, foco inicial/final, leitor de tela e fundo inerte; IDs únicos,
    sem forms aninhados. Durante envio nenhuma saída permitida.
12. 320px, 390px, desktop e fonte ampliada. Aparelho real com teclado no último input:
    erro/rodapé alcançáveis, sem scroll horizontal; screenshots não substituem esse teste.
13. Dia sem atividades, descanso, plano ausente, iniciado e concluído.
14. Inclusão por data e edição por ID sem interferir nos rascunhos de execução/cronômetro.
15. Simular falha de limpeza após sucesso; aviso da página permanece após fechar/remover
    card; nenhum reenvio automático.

Registrar casos/resultados sem credenciais. Screenshot não prova persistência,
concorrência, identidade da atividade ou transação do banco.

## 13. Validação e condição de entrega

Antes de editar: git status/branch/roadmap. Preparar TEST_DATABASE_URL e TEST_DIRECT_URL
apontando ao mesmo PostgreSQL local descartável `kaizen_test` conforme documentação
existente. Não imprimir senhas nem reutilizar base operacional.

Executar em ordem, após cada etapa o conjunto afetado; regressão completa ao final:

```powershell
pnpm exec prettier --check src/features/training/ui src/app/treino/page.tsx
pnpm lint
pnpm structure:check
pnpm typecheck
pnpm exec vitest run src/features/training/ui/lib/training-activity-editor-draft
pnpm exec vitest run src/features/training/ui/hooks/use-training-activity-editor-draft
pnpm exec vitest run src/features/training/ui/components/training-day-page/components/training-activity-modal
pnpm exec vitest run src/features/training/ui/components/training-day-page/components/training-activity-editor
pnpm exec vitest run src/features/training/ui/components/training-day-page/components/training-activity-form
pnpm exec vitest run src/features/training/ui/components/training-day-page/components/training-activity-delete-form
pnpm exec vitest run src/features/training/ui/components/training-day-page/components/training-activity-card
pnpm test:coverage
pnpm test:integration
pnpm test:ci-scripts
pnpm data:check
pnpm build
```

Esperado: todos exit code 0, limites de cobertura atuais e regras de camada/estrutura
preservados. Não usar pnpm ci como script: ele instala dependências. Script completo
é pnpm run ci. Governance exige evento de PR; não rodar isolado sem o evento esperado.
Build não comprova modal/foco/teclado; executar navegador depois.

**Executado na elaboração do guia:** leitura do código, contratos, dependências locais,
checagem de caminhos, fences e revisão documental. Não foram executados testes de uma
implementação futura nem alterados arquivos de produção. Não reciclar evidência anterior.

### Checklist final

- [ ] + só inclusão; lápis só treino escolhido; drawer removido.
- [ ] Campos e condições aprovados, incluindo Treino específico.
- [ ] Rodapé externo aos campos/form, edição com excluir e salvar separados.
- [ ] Layout 320px, fonte ampliada, foco, leitor de tela e teclado real verificados.
- [ ] Novo por data/edit por ID, namespace separado de execução.
- [ ] Cache recupera campos incompletos e intenção de horário/aquecimento.
- [ ] Sem mudanças não grava; reverter ao baseline fica clean.
- [ ] Fechar guarda ou informa falha; sem perda silenciosa.
- [ ] Cache inválido/stale/outra aba/opção ausente não substitui dados atuais.
- [ ] Busy cobre save/delete/X/Esc/backdrop/Enter.
- [ ] Erro preserva valores/cache; saved limpa só o apropriado e fecha uma vez.
- [ ] Data só navega depois de saved; execução local/persistida continua protegida.
- [ ] Excluir confirma e limpa após sucesso; aviso de cache não causa reenvio.
- [ ] Detalhes públicos do plano preservados fora dos modais.
- [ ] Nenhuma mudança de migration/plano/dependência/dados pessoais.
- [ ] U01–U35 e roteiro manual registrados com evidências reais.
- [ ] Validações pendentes da E06-T24 foram concluídas ou explicitamente registradas.
- [ ] Sem merge/deploy apenas por ter aplicado o guia.

## 14. Riscos, parâmetros e reversão

Cache pode ser apagado pelo navegador e não sincroniza entre dispositivos; não prometer
que ele substitui salvamento no servidor. Escopo P0 não tem identidade de usuário.
localStorage não tem lock transacional; revisão protege mutação no banco.
Exceção de rede na inclusão não prova ausência de criação; sem retry automático.
Se for exigida garantia forte de criação única, abrir tarefa de idempotência separada.

400ms e 7 dias são parâmetros definidos neste planejamento, não mudanças da janela de
agenda aprovada. Não revalidar datas pelo relógio de expiração do cache.
A estimativa anterior de 6–10h era preliminar: medir por etapas/gates, não sacrificar
conflitos de cache/acessibilidade para cumprir um número. Modelo menor precisa de
uma etapa por vez, com revisão antes de prosseguir.

Rollback de UI: reverter seus commits e restaurar drawer/imports, sem alterar banco
ou plano. Namespace novo pode ficar inerte ou ser removido pontualmente. Nunca
localStorage.clear(), apagar rascunhos de execução ou remover volumes Docker.
Desfazer operação pessoal já salva não é rollback de código: não mudar dados por conta própria.

Não há pendência de design ou API externa para começar. Banco/navegador dependem de
Docker funcional; teclado real depende de aparelho. Implementador gera os arquivos
finais a partir dos contratos e prova a integração; este documento não afirma que
código futuro já compila ou está pronto para copiar e substituir arquivos inteiros.

## 15. Prompt para o modelo implementador

Copiar o texto abaixo na tarefa de implementação:

> Implemente `docs/implementation/TRAINING-ACTIVITY-MODALS-AND-DRAFTS-IMPLEMENTATION-GUIDE.md`
> neste repositório. Leia o documento inteiro antes de editar. Ele fixa o comportamento
> aprovado: + só inclusão, lápis no card só edição, ações no rodapé e rascunhos locais
> separados da execução. Base analisada: 4af510c. Inspecione branch/roadmap e preserve
> alterações posteriores. O inventário inclui os complementos 21.1/21.2/22.1/22.2.
> Trabalhe nas etapas A a H, uma por vez, validando antes de seguir. Gere código completo
> para cada arquivo, mantendo os contratos e U01–U35. Não invente imports/usuário,
> não instale dependências, não altere backend/plano/migrations nem remova Treino específico.
> Não reimplemente E06-T24; preserve datas, aquecimento, revisão, sessão histórica e
> cronômetro. Recupere modo manual/automático, não apenas o fim exibido. Não confunda
> cache do editor com rascunho de execução. Não faça retry automático de inclusão.
> O guia é planejamento e não código já testado. Execute tipos, estrutura, testes,
> build e navegador com banco descartável. Mantenha pendências da E06-T24 explícitas
> até validar Docker/banco/navegador. Registre resultados reais, sem reciclar evidência.
> Se não conseguir concluir uma validação, registre o bloqueio e continue as etapas
> independentes. Ao terminar, informe alterações, testes e pendências. Não faça merge
> nem deploy sem autorização explícita aplicável a esta nova tarefa.

## 16. Decisões encerradas para evitar novas interpretações

- Modal, não drawer; somente formulário da operação escolhida.
- Mesmos campos condicionais; melhoria de espaçamento/organização permitida.
- Lápis ao lado da lixeira; exclusão também no rodapé de edição.
- Novo por dia; editar por ID; rascunhos locais independentes da execução.
- Cache guardado permite fechar sem confirmação. Erro de cache exige saída explícita.
- Envio bloqueia fechamento e cliques duplicados; erro mantém dados.
- Revisão, ownership e permissão de data continuam no servidor; cache não os determina.
- Sem sincronização/autenticação/edição de concluídos ou cópia de prescrições no cache.

## 17. Ajustes comprovados durante a implementação

O código foi implementado na branch `codex/E06-T25-activity-editor-modals`.
Esta seção registra decisões que refinam o plano inicial sem mudar os campos aprovados.

- A Server Action pode atualizar a árvore e remover o card da origem antes de um effect
  de sucesso. Por isso, limpeza/navegação ocorrem na continuação da action, não no effect.
- useTrainingActionFeedback recebeu opção refreshOnSaved (default true para os demais
  fluxos). Form no editor usa false. O wrapper coordena um único push/refresh em transition.
  Exclusão fora do editor faz seu refresh; dentro, delega ao wrapper sem duplicação.
- O gatilho fica disabled/aria-busy até terminar a atualização. Isso impede reabrir
  imediatamente uma base antiga, receber o DTO novo e cair em stale por uma gravação própria.
- A referência ao gatilho é passada explicitamente para restaurar foco. document.activeElement
  não identifica de forma confiável o botão de abertura em toque ou clique programático.
- O dialog externo tem max-height e overflow-hidden; a altura interna desconta a borda.
  Sem isso, o limite padrão do navegador pode criar rolagem externa e deslocar o rodapé.
- O token correto de texto destrutivo é text-status-destructive-foreground no pacote
  instalado. O rodapé de exclusão usa esse token e área de toque de 44px.
- A ponte do form inclui onNeedsReload para conflito/not_found/resultado incerto de rede.
- Rascunho stale já guardado pode fechar sem regravar nem desbloquear edição. Mudanças
  de outra aba continuam protegidas e não são sobrescritas.
- Uma fixture de rollback da E06-T24 foi corrigida para criar o plano inválido na origem:
  o banco não permite alterar definições depois da criação. Nenhum trigger foi desabilitado.

Evidências e resultados finais ficam no documento da E06-T25. Teclado virtual e área
segura em aparelho físico continuam na E06-T14; emulação de viewport não prova esse ponto.

O ciclo de Tab/Shift+Tab foi explicitado nos controles visíveis do dialog, preservando
a confirmação de exclusão como dialog independente. Chrome confirmou retorno ao
gatilho e contenção do foco, inclusive após várias voltas de Tab.
