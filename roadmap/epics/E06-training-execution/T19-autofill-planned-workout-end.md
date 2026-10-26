---
id: E06-T19
epic: E06
depends_on: [E06-T12]
---

# Preencher automaticamente o fim planejado do treino

## Objetivo

Ao adicionar um treino do plano, calcular o fim planejado a partir do início
informado e da duração da sessão selecionada, sem exigir cálculo manual.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.tsx`
- `src/features/training/application/training-dto.ts`
- `src/features/training/data/prisma-training-repository.ts`
- `src/app/treino/training-actions.ts`

- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.types.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.styles.ts`
- `src/features/training/ui/components/training-day-page/components/training-agenda-drawer/training-agenda-drawer.tsx`
- `src/features/training/ui/hooks/use-training-action-feedback.ts`
- `src/features/training/ui/components/training-day-page/components/training-action-feedback/training-action-feedback.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.test.tsx`
- `src/features/training/application/mutate-training-day.ts`
- `tests/integration/training-mutations.test.ts`

- `src/features/training/ui/components/training-day-page/components/training-activity-form/hooks/use-training-activity-schedule.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.utils.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.utils.test.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.test.tsx`

## Regras confirmadas

- Usar a duração da sessão carregada do plano, nunca um valor fixo na interface.
- Calcular após selecionar a sessão e informar o início, independentemente da ordem.
- A duração atual já inclui aquecimento; não somá-lo novamente.
- Exemplo: início 18h e duração de 40 minutos resultam em fim às 18h40.
- Não iniciar cronômetro nem persistir a atividade somente por preencher o campo.

## Decisões antes da implementação

- Reanalisar e apresentar o plano ao usuário antes de implementar.
- Decidir se o fim continua editável e como preservar uma alteração manual ao trocar início ou sessão.
- Definir o feedback para duração ausente ou término no dia seguinte, respeitando o contrato de horários vigente.
- Confirmar aplicação na edição de atividades existentes, além da inclusão.

## Critérios de aceite

- [x] Fim automático usa a duração real da sessão e não duplica o aquecimento.
- [x] Mudança de início ou sessão segue a política aprovada sem sobrescrever silenciosamente alterações manuais.
- [x] Entrada em qualquer ordem e duração ausente possuem testes.
- [x] Validação no servidor, janela de edição e ownership permanecem preservados.

## Plano detalhado proposto — 26/10/2026

Plano aprovado pelo usuário em 26/10/2026. As seções abaixo preservam o desenho
usado na implementação; o resultado e as evidências estão no fim deste arquivo.

### 1. Diagnóstico comprovado

- `PublicTrainingSessionDto` já expõe `targetDurationMinutes`. Não é necessário
  buscar duração por uma nova API ou incluir um valor fixo na UI.
- Sessão, início e fim usam `defaultValue`, sem sincronização entre campos.
- Inclusão e edição compartilham `TrainingActivityForm`, no drawer da agenda.
- O servidor valida HH:mm e exige fim posterior ao início no mesmo dia.
- `useTrainingActionFeedback` usa `useActionState` e chama `router.refresh()`
  após sucesso; erros e conflitos chegam pelo feedback compartilhado.
- A atualização resolve a definição usando o plano ativo. É necessário testar
  a edição de uma atividade vinculada a versão anterior antes de prometer
  preservação de sua sessão; somente igualdade de `sessionId` não prova igualdade
  da versão ou da duração.

### 2. Experiência principal

1. Usuário escolhe Treino do plano e uma sessão.
2. Ao informar um início completo e válido, o fim aparece automaticamente.
   A ordem inversa também funciona: início antes da seleção da sessão.
3. Abaixo do fim, apresentar uma explicação curta, por exemplo:
   “Calculado pela duração do treino: 40 min.” O número vem da sessão.
4. O campo continua editável. Uma alteração do usuário passa a preservar o fim
   manual, sem solicitar confirmação em modal.
5. No modo manual, mostrar “Horário ajustado por você.” e uma ação secundária
   “Usar duração do treino”, com `type="button"` e sem disparar o formulário.
6. Essa ação volta ao modo automático e aplica o cálculo aos valores atuais;
   não salva a atividade. “Adicionar atividade” e “Salvar alterações” continuam
   sendo as únicas ações de persistência.

O texto deve falar em estimativa de planejamento. Não representa duração real,
cronômetro ou conclusão da atividade.

### 3. Estados e transições

| Situação                                                  | Fim apresentado                                | Próxima mudança de início/sessão |
| --------------------------------------------------------- | ---------------------------------------------- | -------------------------------- |
| Inclusão de treino do plano, sem fim previamente digitado | Automático, quando houver dados válidos        | Recalcular                       |
| Início/sessão ainda incompletos em modo automático        | Vazio, sem manter sugestão obsoleta            | Calcular ao completar            |
| Usuário altera ou apaga o fim                             | Valor manual, inclusive vazio                  | Preservar                        |
| Usuário escolhe Usar duração do treino                    | Nova sugestão ou explicação da impossibilidade | Voltar a recalcular              |
| Edição de atividade existente                             | Horário persistido, em modo preservado/manual  | Preservar até ação explícita     |
| Prática esportiva, mobilidade ou treino específico        | Preenchimento manual                           | Não calcular                     |

Regras complementares:

- Focar o campo, abrir o seletor ou receber novo render não conta como edição
  manual; somente mudança efetiva do valor pelo usuário.
- Não inferir modo automático porque o fim manual coincide com a estimativa.
- Não trocar duração principal por duração curta e não somar aquecimento.
- Ao sair de Treino do plano, preservar o último fim visível como manual;
  não apagar o trabalho do usuário. Ao voltar, preservar esse fim e oferecer
  Usar duração do treino. Se nunca houve um fim informado, permitir automático.
- Se o usuário apagar o fim, respeitar a intenção: não preenchê-lo novamente
  ao mudar outro campo até que solicite o cálculo.
- Não criar preferência global nem gravar o modo automático no banco ou no
  localStorage; ele pertence apenas à interação deste formulário.

### 4. Horários incompletos, inválidos e limite do dia

O cálculo deve usar minutos inteiros do relógio civil, sem `Date`, UTC, fuso do
navegador, conversão de horário de verão ou módulo de 24 horas.

| Entrada                                                    | Comportamento esperado                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| 18:00 + 40 min                                             | 18:40                                                               |
| 23:00 + 59 min                                             | 23:59                                                               |
| 23:20 + 40 min                                             | Não gerar 00:00 nem 24:00; explicar que ultrapassa o mesmo dia      |
| Início apagado ou incompleto                               | Não calcular; remover apenas sugestão automática obsoleta           |
| Duração ausente, zero, negativa, fracionária ou não finita | Não inventar duração; permitir informar fim manualmente             |
| Sessão não encontrada ou plano indisponível                | Não usar outra sessão silenciosamente; explicar ausência da duração |
| Fim manual igual/anterior ao início                        | Sinalizar validação e impedir gravação inválida                     |

Mensagens propostas:

- Duração indisponível: “Não foi possível calcular a duração. Informe o fim planejado.”
- Virada do dia: “Esse treino terminaria no dia seguinte. Ajuste o início ou informe um fim no mesmo dia.”
- Intervalo inválido: “O fim planejado deve ser posterior ao início.”

Não exibir erro agressivo enquanto o usuário ainda preenche um horário.
Orientações de indisponibilidade ficam junto ao fim; erro de horário deve ser
apresentado após interação suficiente com o campo ou tentativa de envio.
Se o usuário optar por um intervalo manual válido mais curto, respeitá-lo: a
duração do plano é uma sugestão, não um mínimo obrigatório de execução.

### 5. Edição, histórico e concorrência

- Abrir Editar não deve alterar nenhum valor nem iniciar um cálculo automático.
- Usar duração da sessão vinculada à atividade quando essa referência estiver
  disponível e comprovada. Nunca substituir sessão histórica pela primeira do
  plano ativo; nunca resolver duração apenas pelo ID textual reutilizado.
- Se a sessão salva não estiver nas opções atuais, manter sua identificação
  explícita e impedir seleção/cálculo implícito de outra. Explicar a limitação.
- Antes de habilitar o fluxo de edição automática, reproduzir o cenário de
  plano antigo na integração. Se a gravação trocar a referência histórica,
  tratar como bloqueador da entrega: propor correção mínima e revisão do
  escopo antes de implementar reconciliação ou alteração de persistência.
- Uma nova revisão recebida enquanto houver alterações locais não pode mudar
  silenciosamente a revisão esperada nem limpar o rascunho do formulário.
  Manter a referência da revisão que originou a edição até sucesso ou recarga
  explícita. Conflito deve preservar os campos e orientar recarregar os dados.
- Troca efetiva de data ou de atividade inicializa outro formulário; atualização
  da mesma atividade durante edição não equivale a autorização para descartá-la.
- Não editar registros concluídos nem ampliar as datas atualmente permitidas.

### 6. Envio e retorno do servidor

- Enviar o fim que o usuário vê, não uma sugestão anterior ou variável paralela.
- Calcular/alternar modos nunca dispara Server Action.
- Durante envio, desabilitar o envio repetido e congelar os controles deste
  formulário para impedir mudanças que não fariam parte da requisição enviada.
- Em erro de validação, indisponibilidade ou conflito, manter tipo, sessão,
  início, fim e modo. Não tratar o simples término da requisição como sucesso.
- Em sucesso, manter feedback claro. Na inclusão, limpar o formulário e seu
  modo para o estado inicial; na edição, reconciliar com os valores salvos e a
  nova revisão, voltando ao modo de preservação do horário existente.
- Conferir o reset dos campos controlados e não controlados no ciclo real de
  `useActionState`; não assumir que o comportamento automático será suficiente.
- Não remodelar o hook de feedback compartilhado sem evidência de necessidade;
  começar com comportamento local no consumidor atual.

### 7. Acessibilidade e uso no celular

- Manter rótulos Início planejado e Fim planejado ligados aos respectivos inputs.
- Vincular orientações e erros ao campo por `aria-describedby`; marcar
  `aria-invalid` apenas quando houver erro efetivo.
- Atualização automática não move foco, abre modal ou altera a posição da tela.
- Usar anúncio discreto, sem `role="alert"` a cada alteração de horário.
  Testar leitura do resultado sem duplicar mensagens.
- A ação Usar duração do treino precisa funcionar por teclado e toque,
  com nome acessível e apresentação pelo Design System existente.
- Conferir layout estreito, texto longo, zoom, ordem de tabulação e edição pelo
  seletor nativo de horário. Não simular teste de teclado/safe area físico como
  prova; documentar se dispositivo real não estiver disponível.

### 8. Arquivos e responsabilidades previstas

Os caminhos abaixo são planos de alteração, não arquivos já implementados.

| Ação                   | Caminho                                                                                                                           | Responsabilidade                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Alterar                | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.tsx`              | Compor campos controlados, mensagens, ação de cálculo e estado de envio                       |
| Criar                  | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.utils.ts`         | Calcular fim com resultado explícito para dados incompletos, duração inválida e limite do dia |
| Criar                  | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.utils.test.ts`    | Exercitar regras aritméticas e entradas defensivas                                            |
| Criar                  | `src/features/training/ui/components/training-day-page/components/training-activity-form/hooks/use-training-activity-schedule.ts` | Estado local, modos manual/automático e transições, sem acesso ao banco                       |
| Criar                  | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.test.tsx`         | Testar a experiência observável do formulário                                                 |
| Alterar, se necessário | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.types.ts`         | Contratos locais e resultados de cálculo com nomes de negócio                                 |
| Alterar, se necessário | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.styles.ts`        | Composição das orientações e ação, usando tokens existentes                                   |
| Ampliar, se necessário | `tests/integration/training-mutations.test.ts`                                                                                    | Garantir contrato de horários e detectar regressão de versão histórica                        |

O cálculo deve ter uma fonte única; valores automáticos devem ser derivados do
estado atual para evitar efeitos que sobrescrevam digitação. Não criar endpoint,
dependência, migration ou mudança de DTO: a duração já existe. O servidor segue
aceitando ajustes manuais válidos e validando origem, workspace, ownership,
revisão e janela de datas. Não aceitar IDs de workspace vindos do navegador.

### 9. Matriz mínima de regressão

| Grupo              | Cenários obrigatórios                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Fluxo principal    | Sessão antes/depois do início; primeira sessão selecionada; mudança da sessão; mudança do início; duração principal sem duplicar aquecimento  |
| Controle manual    | Ajuste do fim; fim apagado; valor manual igual ao automático; troca de sessão/início sem sobrescrever; retomar automático explicitamente      |
| Tipos de atividade | Sair e voltar ao treino do plano; os outros tipos mantêm preenchimento manual; opções legadas preservadas até E06-T20                         |
| Horários           | 00:00, 23:59, exatamente meia-noite, virada do dia, duração inválida, início vazio e fim anterior/igual ao início                             |
| Edição             | Abrir sem alterações; editar horários; manter sessão e versão histórica; sessão ausente no plano atual; remount por mudança de data/atividade |
| Servidor           | Payload contém os horários visíveis; revisão obsoleta dá conflito; acesso fora da janela e ownership inválido continuam bloqueados            |
| Retorno            | Sucesso na inclusão e edição; erro e conflito preservam campos; envio duplicado bloqueado; refresh não descarta alterações não enviadas       |
| Acessibilidade     | Teclado, foco estável, mensagens vinculadas, botão de cálculo não envia formulário, layout em viewport estreito                               |

Testes do componente devem simular interação e retorno da ação; mocks não podem
substituir todas as verificações do ciclo de envio/reset. A jornada real com
persistência comprova ao menos uma inclusão, edição e falha de gravação.

### 10. Ordem de execução e aceite da entrega

1. Após aprovação, revalidar a base de `developer` e criar a branch
   `codex/E06-T19-autofill-planned-workout-end`. Preservar os commits documentais
   locais ainda não integrados; não usar reset ou force push para trocar de base.
2. Confirmar a integridade histórica na edição e estabilizar os casos esperados
   antes de habilitar o cálculo nesse caminho.
3. Implementar cálculo puro, transições locais e apresentação, nessa ordem.
4. Cobrir os comportamentos com testes proporcionais; executar formato, lint,
   estrutura, tipos e testes relevantes pelos scripts existentes.
5. Validar integração PostgreSQL pertinente, build, dados e gates aplicáveis.
   Executar `pnpm run ci` com dependências de teste disponíveis; indisponibilidade
   deve ser registrada, nunca convertida em aprovação de check não executado.
6. Percorrer inclusão e edição na UI, incluindo falha, modo manual e virada do dia.
7. Fazer revisão semântica, `git diff --check` e busca de segredos; atualizar
   checklist, resultado, roadmap e changelog apenas com evidências obtidas.

A mudança é entregue quando a matriz aplicável passa, não há troca silenciosa de
sessão/versão, campos manuais sobrevivem às transições e falhas, e o resultado
persistido corresponde ao horário exibido. Nenhum check de implementação está
marcado como concluído por este planejamento.

### 11. Limites e reversão

- E06-T20, Dieta, reconciliação de planos e cronômetro ficam fora deste ajuste.
- A alteração pretendida é de UI, sem migração de dados. Pode ser revertida
  removendo o cálculo automático e restaurando o preenchimento manual.
- Reverter a UI não desfaz horários que o usuário já confirmou e salvou; correções
  desses registros continuam seguindo o fluxo normal, sem limpeza destrutiva.
- Se a investigação histórica exigir mudança de persistência, reavaliar os
  testes e o rollback antes de ampliar o escopo.

## Resultado

Implementado o cálculo em minutos civis com a duração da sessão, sem duplicar
aquecimento. O fim permanece editável; alterações e limpezas manuais são
preservadas até a ação explícita Usar duração do treino. Inclusão reinicia o
formulário após sucesso; edição preserva horários existentes, revisão de origem
e duração da sessão histórica. Falhas de conexão, validação e conflito mantêm
o preenchimento; envio congela controles e impede duplicação.

A inspeção confirmou a resolução indevida pelo plano ativo na atualização.
Corrigido o caso de sessão inalterada: servidor preserva versão, sessão e
preparação existentes, com ownership e revisão na consulta e na gravação.
A seleção explícita de outra sessão continua passando pelas regras existentes.
Não houve alteração de schema, migration, dependência ou dados pessoais.

### Evidências da implementação

- Suíte unitária completa aprovada com cobertura global de 90,92% das linhas.
- 34 testes direcionados de cálculo e componente aprovados, usando o ciclo real
  de `useActionState`; cobrem inclusive rejeição da chamada por falta de conexão.
- Integrações PostgreSQL: 45 testes aprovados, incluindo versão histórica com
  mesmo ID textual em outro plano, revisão obsoleta e workspace diferente.
- Tipos, lint, formato, estrutura e fronteiras, schema Prisma, build e integridade
  dos dados aprovados; 33 testes dos validadores aprovados.
- Chrome real em viewport 390×844: cálculo, preservação manual, inclusão e edição
  persistidas, recálculo explícito, falha de conexão preservando campos e aviso
  de virada do dia aprovados em banco isolado descartável.
- Revisão visual da captura em tela estreita concluída. Teclado e safe area de
  dispositivo físico não foram testados nem considerados comprovados.
- Revisão semântica: cálculo puro sem datas/fuso, estado local coeso no hook,
  componente compõe formulário, e preservação histórica ocorre no servidor.

### Histórico da auditoria antes da PR #68

A auditoria de dependências falhou com 19 achados: 3 baixos, 10 moderados,
4 altos e 2 críticos. Manifesto e lockfile foram preservados; esta tarefa não
atualiza dependências. Não declarar CI integral ou auditoria aprovada nem
promover a entrega como se esse gate estivesse verde.

A validação do navegador usou configuração apenas em memória e PostgreSQL
isolado. O servidor e o banco temporários foram encerrados após o teste.

### Atualização após a correção de segurança

A [PR #68](https://github.com/fradelli/nextjs-kaizen-app/pull/68) foi integrada em
`developer` com sete checks aprovados e auditoria sem achados. Esta branch
incorporou `410042d` por merge, preservando os registros das duas entregas e
resolvendo conflitos apenas no changelog, índice e ponteiro do roadmap.
A revalidação da combinação está registrada na [PR #69](https://github.com/fradelli/nextjs-kaizen-app/pull/69).
A integração exige sucesso dos sete checks sobre o commit final, sem bypass.
