# Modelo de dados do P0

- **Tipo:** Arquitetura.
- **Área:** Banco de dados.
- **Tarefas relacionadas:** [E05-T01](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E05-database-and-import/T01-design-relational-model.md), [E05-T02](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E05-database-and-import/T02-configure-database-and-migrations.md), [E05-T04](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E05-database-and-import/T04-test-persisted-integrity.md), [E05-T06](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E05-database-and-import/T06-implement-personal-access.md).

> Desenho relacional inicial de E05-T01: as 18 entidades abaixo não são inventário exaustivo do banco atual. Confira [modelos](../../prisma/models) e [migrations](../../prisma/migrations). A operação evoluiu para `TrainingDayActivity`, intervalos e resultados de atividade/séries; o modelo antigo de execução permanece histórico conforme **Modelo conceitual / Treino** na [arquitetura](TARGET-ARCHITECTURE.md). O catálogo acrescenta `CatalogEquipment`, `CatalogExercise`, `CatalogExerciseAlias`, `CatalogRequirement` e `CatalogImport`, descritos no [plano do catálogo](../plans/catalog/CATALOG-IMPORT-PLAN.md). `PairingRateLimit` no schema não comprova autenticação ativa; vale a decisão de workspace público. Esta nota não autoriza migration ou remoção de legado.

## Status e fontes

- Data: 2026-09-12.
- Tarefa: E05-T01.
- Decisão de implementação: detalha as 18 entidades conceituais já aprovadas.
- Limite: especificação relacional; nenhum banco, migration ou Client é criado aqui.
- Fontes normativas: [P0](../product/P0.md), [arquitetura](TARGET-ARCHITECTURE.md),
  [fonte de verdade](../decisions/DATA-SOURCE-TRANSITION.md),
  [privacidade](../decisions/PRIVACY-AND-OPERATIONS.md) e
  [PostgreSQL/Prisma](../decisions/DATABASE-AND-ORM.md).

Git/JSON é a única fonte editável das definições; banco é a única fonte editável
das atribuições e execuções. JSONB preserva a fonte de auditoria, não cria outro
editor. Os planos atuais não são alterados, mesmo quando seu status textual
histórico ainda é `active`: somente o ponteiro do commit determina a ativação.

## Convenções físicas

- Nomes abaixo são os futuros models Prisma; colunas SQL usam snake_case.
- `id uuid PK` em cada entidade, gerado no servidor/banco, nunca pelo cliente.
- `text` preserva IDs snake_case, versões e conteúdo textual da fonte.
- `date` representa data civil de America/Sao_Paulo; `timestamptz` representa UTC.
- `?` indica coluna nullable; todas as demais são NOT NULL.
- `created_at timestamptz` existe em todas as entidades; tabelas operacionais
  mutáveis também têm `updated_at timestamptz` e `revision integer DEFAULT 0 CHECK >= 0`.
- Comentários: text nullable, até 1.000 caracteres, sem HTML; descrição alimentar
  alternativa até 500 caracteres e não vazia após trim.
- Toda FK usa RESTRICT/NO ACTION em exclusão, inclusive relações de definição.
  Não há exclusão física de histórico no P0.
- Toda tabela pessoal tem `workspace_id uuid FK Workspace` e UNIQUE
  `(workspace_id,id)` para FKs compostas de ownership.
- Definições públicas não têm workspace pessoal; não armazenam execução.
- Resultados são não negativos e finitos. A dose prescrita não limita o resultado
  real: uma série pode registrar valor fora da faixa sem falsificar o histórico.
- Colunas de source/status são preservadas, não reinterpretadas como aprovação clínica.

## Estados e medidas

| Contrato                      | Valores                                                          |
| ----------------------------- | ---------------------------------------------------------------- |
| Domínio                       | training, nutrition                                              |
| Programação de treino         | training, mobility, rest, unassigned                             |
| Sessão executada              | not_started, in_progress, completed, followed_different, skipped |
| Preparação/mobilidade e série | pending, completed, skipped                                      |
| Refeição executada            | pending, followed_plan, followed_different, skipped              |
| Medição do exercício          | repetitions, seconds, contacts, per_side                         |
| Unidade normalizada           | repetitions, seconds, contacts                                   |
| Escopo normalizado            | total, each_side, two_directions, four_directions                |

Estados de formulário (salvando/erro etc.) são transitórios da UI e não são enums
persistidos. Completude alimentar e contagens são derivadas; não existe nota
nutricional, contador de consumo ou conclusão que transforme pendências em realizadas.

## Plataforma mínima

### 1. Workspace

Colunas: `id`, `created_at`. Um ID fixo resolvido server-side no P0; não adicionar
nome, identidade, e-mail, usuário ou membership sem consumidor aprovado.
Boundary obrigatório para todas as tabelas pessoais. Sem índice além da PK.

### 2. ImportBatch

Colunas: `id`, `source_kind text`, `source_path text`, `source_sha256 char(64)`,
`source_schema_version text`, `application_commit char(40)`,
`source_document jsonb`, `started_at timestamptz`, `finished_at timestamptz?`,
`result text`, `error_code text?`, `created_at`.

Source kinds: exercise_library, execution_metadata, training_plan,
nutrition_plan, training_pointer, nutrition_pointer. Resultado: in_progress,
completed, failed. UNIQUE `(source_path,source_sha256)`; checks de hashes hex,
caminho relativo sem traversal, término >= início, completed/failed exigem término;
erro sanitizado somente em failed. Índice por application_commit.

A unidade é uma fonte por hash, não um identificador de clone. Uma execução de CLI
pode importar vários lotes na mesma transação. Falha transacional não deixa lote
parcial ativo; uma falha sanitizada pode ser registrada fora da transação somente
sem projeções incompletas. Reimportar completed reutiliza o lote e produz no-op.
Documento, caminho, hash e schema de um lote completed são insert-only.

### 3. PlanActivation

Colunas: `id`, `domain text`, `logical_environment text`,
`training_plan_version_id uuid?`, `nutrition_plan_version_id uuid?`,
`pointer_import_batch_id uuid FK ImportBatch`, `activated_at timestamptz`,
`superseded_at timestamptz?`, `created_at`.

FKs opcionais apontam aos respectivos planos; CHECK exige exatamente a FK do
domínio declarado e a outra null. Ambiente lógico é local/preview/staging/production,
resolvido pelo servidor, sem host, URL ou credencial. Índice único parcial
`(logical_environment,domain) WHERE superseded_at IS NULL`; índice de histórico
`(logical_environment,domain,activated_at)`; superseded_at >= activated_at.

Trocar ponteiro fecha a ativação anterior e insere outra atomicamente. Reativar
a mesma versão ativa é no-op. Versões e dias históricos não são atualizados.

### 4. PairingRateLimit

Colunas pessoais: `id`, `workspace_id`, `bucket_key text`,
`window_started_at timestamptz`, `attempt_count integer`,
`blocked_until timestamptz?`, `expires_at timestamptz`,
`created_at`, `updated_at`, `revision`.

UNIQUE `(workspace_id,bucket_key)`; count >= 0; expires_at > window_started_at;
blocked_until, quando presente, >= window_started_at. Índice em expires_at para
limpeza restrita a dados de rate limit, não ao histórico de domínio.

Bucket keys do P0: global e fingerprint opaco de origem. Não armazenar IP bruto,
chave de edição, hash da chave de edição, cookie ou payload. Fingerprint deve usar
HMAC com segredo server-side e separação de domínio, não hash simples do IP.
Uma janela global impede contornar o limite criando fingerprints; janela de origem
limita abuso localizado. Incremento e bloqueio são atômicos.

A entidade permanece no schema para uma proteção de acesso futura, mas não é usada
no modo público atual. Duração da janela, limites, segredo de HMAC e retenção só
serão definidos quando houver tarefa aprovada de autenticação; não são fatos a
inventar nem constantes do schema. `expires_at` garante retenção finita quando a
entidade passar a ter consumidor.

## Definições de treino (públicas, imutáveis)

### 5. ExerciseDefinition

Colunas: `id`, `exercise_id text`, `library_import_batch_id uuid FK ImportBatch`,
`metadata_import_batch_id uuid FK ImportBatch`, `name_pt text`,
`definition jsonb`, `measurement_type text`, `load_applicable boolean`,
`load_unit text?`, `normalization_rule jsonb`, `created_at`.

UNIQUE `(library_import_batch_id,metadata_import_batch_id,exercise_id)`.
CHECK: load_applicable -> load_unit=kg; !load_applicable -> load_unit IS NULL.
Medição e regra vêm do [contrato revisado](../../data/training-execution-metadata.json).
definition preserva instruções, cues e alertas originais; não vira prescrição nova.
Biblioteca não tem versão de conteúdo declarada: seu batch/hash define identidade,
não last_updated nem schema_version. Alterar biblioteca ou metadados cria nova
ExerciseDefinition; exercícios de versões antigas preservam seus bindings.

### 6. TrainingPlanVersion

Colunas: `id`, `plan_id text`, `version text`, `source_status text`,
`source_created_on date`, `source_updated_on date`, `import_batch_id uuid FK ImportBatch`,
`created_at`. UNIQUE `(plan_id,version)`; UNIQUE import_batch_id.
FK ao lote preserva schema, hash, commit e documento completo, inclusive regras
globais e observações não projetadas. Mesmo ID/versão com outro hash é conflito.

### 7. TrainingSessionDefinition

Colunas: `id`, `training_plan_version_id uuid FK TrainingPlanVersion`,
`session_id text`, `name text`, `target_duration_minutes integer`,
`short_duration_minutes integer?`, `intensity text?`, `notes text?`, `created_at`.
UNIQUE `(training_plan_version_id,session_id)` e
`(training_plan_version_id,id)`; durações > 0; índice pela versão via unique.
Não inferir sessão principal/preparação pelo nome: o papel é explícito na atribuição.

### 8. TrainingExerciseDefinition

Colunas: `id`, `training_plan_version_id uuid`, `session_definition_id uuid`,
`exercise_definition_id uuid FK ExerciseDefinition`, `ordinal integer`,
`sets integer`, `prescribed_text text`, `rest_seconds integer?`,
`priority text?`, `notes text?`, `normalized_dose jsonb`, `created_at`.

FK composta `(training_plan_version_id,session_definition_id)` à sessão garante
a versão. UNIQUE `(session_definition_id,ordinal)` e
`(training_plan_version_id,session_definition_id,id)`; ordinal/sets > 0;
rest >= 0 ou null quando desconhecido. Exercício pode aparecer mais de uma vez:
não impor unique por exercise_id. normalized_dose é exatamente a regra revisada
daquela string, com unidade, escopo, faixa e qualifier; não parsear livremente na UI.

## Operação de treino (privada)

### 9. DailyTrainingAssignment

Colunas pessoais: `id`, `workspace_id`, `civil_date date`, `kind text`,
`training_plan_version_id uuid?`, `main_session_id uuid?`,
`preparation_session_id uuid?`, `reason text?`, `created_at`, `updated_at`, `revision`.

UNIQUE `(workspace_id,civil_date)`; UNIQUE
`(workspace_id,id,training_plan_version_id)`; ambas as sessões têm FKs compostas
para a mesma versão. CHECK: training/mobility exigem versão e sessão principal;
rest/unassigned têm versão e sessões null; preparation somente em training e
diferente da principal. Mobilidade só aceita sequência explicitamente prescrita,
nunca fabrica uma sessão a partir do catálogo. Não existe sequência de mobilidade
autônoma aprovada nos planos atuais: ausência de fonte mantém essa escolha indisponível.

Versão e sessões são congeladas quando há resultados persistidos. Alterar a
programação não pode mover resultados para outra versão; uma futura política de
reatribuição após registros exige decisão de produto, não exclusão silenciosa.

### 10. TrainingExecution

Colunas pessoais: `id`, `workspace_id`, `assignment_id uuid`,
`training_plan_version_id uuid?`, `status text`, `comment text?`,
`started_at timestamptz?`, `completed_at timestamptz?`,
`created_at`, `updated_at`, `revision`.

FK `(workspace_id,assignment_id)` ao assignment é sempre obrigatória; FK adicional
workspace+assignment+versão garante o binding não nulo. Trigger usa comparação
null-safe para exigir a mesma versão do assignment, inclusive null em rest:
FK composta nullable sozinha não protege esse caso. UNIQUE `(workspace_id,assignment_id)`
e `(workspace_id,id,training_plan_version_id)`. CHECK de estados, limites de
comentário e completed_at >= started_at quando ambos presentes.
followed_different exige comentário não vazio. Concluir com pendências registra
confirmação no comando, não altera séries; não há contador materializado.
Descanso admite comentário mas nunca cria filhos de exercício.

### 11. TrainingExerciseExecution

Colunas pessoais: `id`, `workspace_id`, `training_execution_id uuid`,
`training_plan_version_id uuid`, `session_definition_id uuid`,
`exercise_definition_id uuid` (FK TrainingExerciseDefinition),
`role text` (main/preparation/mobility), `item_status text`,
`comment text?`, `created_at`, `updated_at`, `revision`.

FKs compostas ligam execução/versão/workspace e exercício/sessão/versão.
UNIQUE `(workspace_id,training_execution_id,exercise_definition_id,role)`.
Trigger de binding garante que sessão é main/preparation atribuída e role coincide
com kind. Preparation/mobility usam pending/completed/skipped por item e não criam
séries/carga. Para main, item_status permanece pending; progresso é derivado das
séries, evitando dois status editáveis concorrentes. Índice do pai via unique.

### 12. TrainingSetExecution

Colunas pessoais: `id`, `workspace_id`, `exercise_execution_id uuid`,
`set_number integer`, `status text`, `value integer?`,
`left_value integer?`, `right_value integer?`, `direction_values jsonb?`,
`load_kg numeric(10,3)?`, `created_at`, `updated_at`, `revision`.

FK composta workspace+exercise_execution; UNIQUE
`(workspace_id,exercise_execution_id,set_number)`; set_number >= 1.
Trigger exige role main e set_number <= sets da definição.
CHECK de medidas inteiras >= 0 e carga decimal finita >= 0; NaN/infinidades são rejeitados.
Unidade de carga é kg da definição, não unidade escolhida livremente.

- pending/skipped: todas as medidas e carga null; completed: medida compatível obrigatória.
- total: apenas value; each_side: apenas left_value e right_value, ambos obrigatórios.
- two_directions: apenas direction_values, chaves forward/backward.
- four_directions: apenas direction_values, chaves flexion/extension/left/right.
- Mapas direcionais exigem exatamente as chaves declaradas, valores inteiros >= 0;
  não reduzir quatro tempos a uma soma nem duplicar um valor por inferência.
- Unidades por lado podem ser repetitions ou seconds; unidade vem de normalized_dose.
- Carga só existe quando load_applicable e role main; null representa ausência de
  carga externa, nunca atribuir zero automaticamente ao peso corporal.
- Exercício com carga aplicável em aquecimento continua sem carga: o papel da
  atribuição prevalece sobre a possibilidade geral do exercício.

Checks entre tabelas não são CHECK SQL fictícios: implementar triggers de integridade
na E05-T02, reforçados pelo domínio/repository e testados em PostgreSQL na E05-T04.

## Definições alimentares (públicas, imutáveis)

### 13. NutritionPlanVersion

Colunas: `id`, `plan_id text`, `version text`, `lifecycle_status text`,
`professional_status text`, `source_created_on date`, `source_updated_on date`,
`effective_from date`, `effective_until date?`, `timezone text`,
`import_batch_id uuid FK ImportBatch`, `created_at`.

UNIQUE `(plan_id,version)` e import_batch_id; effective_until >= effective_from ou null.
FK ao lote preserva approval/provenance/use_policy/unknowns sem reinterpretar null
como zero. professional_status=not_validated permanece explícito; faixa não é
calibrada nem consumo estimado. Tipos/opções importados nunca são editados na UI.

### 14. NutritionDayTypeDefinition

Colunas: `id`, `nutrition_plan_version_id uuid FK NutritionPlanVersion`,
`day_type_id text`, `ordinal integer`, `label text`, `energy_band_id text`,
`minimum_kcal integer`, `maximum_kcal integer`, `energy_band_status text`,
`minimum_modules integer`, `maximum_modules integer`, `meal_rule text`, `created_at`.

UNIQUE `(nutrition_plan_version_id,day_type_id)`,
`(nutrition_plan_version_id,ordinal)`, `(nutrition_plan_version_id,id)`;
mínimos >= 0 e máximos >= mínimos, ordinal > 0.
Faixa e módulos são projeções da fonte da versão, não metas calculadas.
Sem tabela de calorias/consumo ou módulo operacional sem consumidor.

### 15. MealDefinition

Colunas: `id`, `nutrition_plan_version_id uuid FK NutritionPlanVersion`,
`meal_id text`, `ordinal integer`, `label text`, `default_time time?`,
`required boolean`, `use_when text?`, `timing_rules jsonb`, `created_at`.

UNIQUE `(nutrition_plan_version_id,meal_id)`,
`(nutrition_plan_version_id,ordinal)`, `(nutrition_plan_version_id,id)`; ordinal > 0.
timing_rules preserva regras/condições/janelas e IDs de opções da mesma refeição;
validador/importador verifica suas referências. Ordenação contextual ocorre na
apresentação sem alterar ordinal. Horário desconhecido continua null.

Relação física auxiliar `NutritionDayTypeMeal` (junção, não 19ª entidade de domínio):
`nutrition_plan_version_id uuid`, `day_type_id uuid`, `meal_id uuid`, `ordinal integer > 0`.
PK `(day_type_id,meal_id)`; UNIQUE `(day_type_id,ordinal)`; FKs compostas
versão+daytype e versão+meal com RESTRICT. Índice por meal_id.
Necessária para representar meal_ids e não expor refeição de outro tipo/versão.

### 16. MealOptionDefinition

Colunas: `id`, `nutrition_plan_version_id uuid`, `meal_definition_id uuid`,
`option_id text`, `ordinal integer`, `label text`, `use_when text?`,
`follow_up_rule text?`, `items jsonb?`, `unknowns jsonb?`,
`reference_option_id uuid?`, `created_at`.

FK composta versão+meal; FK composta versão+reference_option à própria tabela.
UNIQUE `(meal_definition_id,option_id)`, `(meal_definition_id,ordinal)`,
`(nutrition_plan_version_id,meal_definition_id,id)` e `(nutrition_plan_version_id,id)`.
CHECK XOR items/reference, não autorreferência, ordinal > 0.
Trigger/importador rejeita ciclos e referências de outra versão; referência pode
apontar a opção de outra refeição da mesma versão. Nunca duplicar items resolvidos:
leitura resolve a cadeia e mantém ID da opção local selecionada.

## Operação alimentar (privada)

### 17. DailyNutritionAssignment

Colunas pessoais: `id`, `workspace_id`, `civil_date date`,
`nutrition_plan_version_id uuid`, `day_type_id uuid`,
`created_at`, `updated_at`, `revision`.

UNIQUE `(workspace_id,civil_date)`, `(workspace_id,id,nutrition_plan_version_id)`.
FK composta versão+daytype. Ausência de atribuição é ausência de linha, não um
day_type padrão nem faixa fictícia. Plano apresentado é fixado ao registrar.
Reatribuição não pode migrar refeições existentes para outra versão sem decisão
explícita; revisão protege contra troca concorrente.

### 18. MealExecution

Colunas pessoais: `id`, `workspace_id`, `assignment_id uuid`,
`nutrition_plan_version_id uuid`, `meal_definition_id uuid`,
`status text`, `option_definition_id uuid?`, `alternative_description text?`,
`comment text?`, `created_at`, `updated_at`, `revision`.

FK composta workspace+assignment+versão; versão+meal; versão+meal+option garante
opção da refeição apresentada. UNIQUE `(workspace_id,assignment_id,meal_definition_id)`.
Trigger valida membership da refeição no daytype via junção.
CHECK seguido:

- pending/skipped -> opção e descrição null;
- followed_plan -> opção obrigatória e descrição null;
- followed_different -> opção null e descrição trim não vazia, até 500 caracteres.

Mudança de estado limpa os campos incompatíveis na mesma transação. Comentário
independente até 1.000 caracteres. Não armazenar resumo diário duplicado.

## Importação, integridade e índices

1. Parse/schema e referências antes da transação; calcular hashes dos bytes do commit.
2. Resolver library + metadados imutáveis, depois planos e filhos, depois ponteiros.
3. Constraint natural decide no-op/conflito; conferir hash, nunca atualizar definição.
4. Ativação nova só fica visível junto do commit de todos os lotes.
5. Índices únicos acima suportam buscas diárias e filhos; PostgreSQL não cria
   índice de FK automaticamente: indexar FKs que não sejam prefixo de um unique,
   incluindo import_batch_id, exercise_definition_id e FKs de ativação.
6. Mutação filtra workspace+id+revision e incrementa revision; zero linhas é conflito.
7. Constraints de binding e imutabilidade serão triggers/SQL revisados, não
   omitidos por limitação do Prisma. Runtime não recebe UPDATE/DELETE de definições.
8. Atualizar atribuição/registro inicial e filhos acontece atomicamente.
9. Testes de ownership forjado, binding de outra versão, carga incompatível,
   status alimentar, concorrência, ativação histórica e importação dupla são
   obrigatórios nas tarefas E05-T02/T03/T04; esta tarefa não afirma tê-los executado.

## Revisão dos metadados

Cobertura: todos os 38 IDs usados pelos dois planos versionados, não somente
o ponteiro ativo. Uma linha revisada por exercício; não há classificação por
categoria, nome ou regex. Regex no validador apenas verifica a gramática de doses
já mapeadas explicitamente. Dose nova ou exercício novo exige nova revisão.

`load_applicable=true` significa carga externa opcional no contrato, não recomendação
de adicioná-la. false significa que estes planos/biblioteca não aprovam uma medida
externa em kg para essa variante, não uma afirmação universal sobre o exercício.

| Exercise ID                   | Medição     | Carga kg | Evidência da classificação                                                                                                |
| ----------------------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `snap_down_stick`             | repetitions | não      | Preparação de aterrissagem sem carga externa prescrita.                                                                   |
| `jump_squat`                  | repetitions | opcional | Plano permite explicitamente peso corporal ou carga externa leve.                                                         |
| `loaded_squat`                | repetitions | opcional | Plano prescreve variações com carga externa.                                                                              |
| `romanian_deadlift`           | repetitions | opcional | Biblioteca descreve carga e plano prescreve força carregada.                                                              |
| `nordic_hamstring`            | repetitions | não      | Variante assistida; assistência não é carga externa em kg.                                                                |
| `standing_calf_raise`         | repetitions | opcional | Plano e biblioteca permitem progressão com anilha.                                                                        |
| `seated_calf_raise`           | repetitions | opcional | Biblioteca explicita carga sobre a coxa.                                                                                  |
| `pallof_press`                | per_side    | opcional | Cabo pode ter carga em kg; resistência de elástico não é convertida em kg.                                                |
| `pogo_jump`                   | contacts    | não      | Contatos de pliometria sem carga externa prescrita.                                                                       |
| `lateral_hop_and_stick`       | per_side    | não      | Saltos por lado sem carga externa prescrita.                                                                              |
| `bulgarian_split_squat`       | per_side    | opcional | Plano permite explicitamente anilhas ou barra.                                                                            |
| `hip_thrust`                  | repetitions | opcional | Variante carregada na biblioteca.                                                                                         |
| `short_lever_copenhagen`      | per_side    | não      | Isometria por lado; progressão de alavanca não equivale a kg.                                                             |
| `pull_up`                     | repetitions | opcional | Plano e biblioteca permitem carga externa adicional.                                                                      |
| `chin_up`                     | repetitions | opcional | Regra global de progressão de força do plano permite incremento de carga; é alternativa de puxada, não carga obrigatória. |
| `australian_row`              | repetitions | não      | Progressão prescrita por inclinação; não há carga externa aprovada.                                                       |
| `parallel_bar_dip`            | repetitions | opcional | Plano permite explicitamente carga com fixação segura.                                                                    |
| `pike_push_up`                | repetitions | não      | Progressão de posição corporal; não há carga externa prescrita.                                                           |
| `push_up`                     | repetitions | opcional | Plano e biblioteca permitem carga externa segura.                                                                         |
| `side_plank`                  | per_side    | não      | Isometria por lado sem carga externa prescrita.                                                                           |
| `cervical_isometric_four_way` | seconds     | não      | Resistência manual em quatro direções; não quantificar em kg.                                                             |
| `barbell_row`                 | repetitions | opcional | Biblioteca explicita barra e carga progressiva.                                                                           |
| `barbell_overhead_press`      | repetitions | opcional | Plano e biblioteca explicitam barra carregada.                                                                            |
| `wall_handstand_push_up`      | repetitions | não      | Amplitude e peso corporal; não há carga externa prescrita.                                                                |
| `plate_lateral_raise`         | repetitions | opcional | Plano e biblioteca explicitam anilhas.                                                                                    |
| `hip_flexor_march`            | per_side    | não      | Plano ativo prescreve resistência manual; não converter força manual em kg.                                               |
| `dead_bug`                    | per_side    | não      | Movimento corporal por lado sem carga externa prescrita.                                                                  |
| `plank_shoulder_tap`          | per_side    | não      | Toques por lado sem carga externa prescrita.                                                                              |
| `wrist_rock`                  | repetitions | não      | Repetições por direção de mobilização; sem carga externa em kg.                                                           |
| `scapular_pull_up`            | repetitions | não      | Preparação escapular, sem carga externa prescrita.                                                                        |
| `scapular_push_up`            | repetitions | não      | Preparação escapular, sem carga externa prescrita.                                                                        |
| `quadruped_thoracic_rotation` | per_side    | não      | Mobilização por lado sem carga externa prescrita.                                                                         |
| `knee_to_wall`                | per_side    | não      | Mobilização por lado sem carga externa prescrita.                                                                         |
| `hip_90_90_transition`        | per_side    | não      | Transição por lado sem carga externa prescrita.                                                                           |
| `dynamic_lunge_with_rotation` | per_side    | não      | Aquecimento por lado sem carga externa prescrita.                                                                         |
| `bodyweight_squat`            | repetitions | não      | Aquecimento explicitamente com peso corporal.                                                                             |
| `progressive_vertical_jump`   | repetitions | não      | Três saltos com intensidades qualitativas preservadas.                                                                    |
| `general_locomotion_warmup`   | seconds     | não      | Minutos de locomoção convertidos para segundos.                                                                           |

### Normalização explícita

[Metadados](../../data/training-execution-metadata.json) e
[schema](../../schemas/training-execution-metadata.schema.json) mantêm, para cada
texto prescrito, mínimo/máximo, unidade, escopo e qualifier. Minutos são convertidos
multiplicando por 60, sem arredondamento. each_leg e each_side representam valores
esquerdo/direito; segundos por lado continuam segundos, não repetições.
each_direction cervical significa quatro direções; wrist_rock preserva duas.
easy/easy_or_assisted e at_60_75_90_percent continuam qualifiers, nunca são descartados.
A faixa 60/75/90 não é carga nem medida de resultado; é a sequência textual aprovada.

Cada entrada exige exercise_id, measurement_type, load_applicable, load_unit e
normalization_rule. reviewed_plan_paths declara a cobertura exata dos arquivos
versionados. Mudança em dose, unidade, escopo ou carga cria revisão dos metadados;
importação existente preserva seu hash e ExerciseDefinition.

## Validação e limites

- `pnpm data:check`: schema, duplicação, cobertura, referências e normalizações.
- `pnpm test:ci-scripts`: regressões com fixtures sintéticas.
- `pnpm run ci` e `git diff --check`: gates locais, sem simular banco pronto.
- Schema não comprova adequação clínica, eficácia ou execução pessoal.
- Sem User/Membership, endpoint, backend separado, Prisma Client ou migration.
- E05-T06 foi cancelada; pareamento e seus parâmetros permanecem fora do escopo até uma tarefa futura de autenticação.
- Interface de valores direcionais continua na E06; o contrato evita perder a fonte.
- Correção do modelo antes de persistência reverte apenas documentos/metadados/
  validadores. Após E05-T02, alteração estrutural exige migration e rollback explícitos.
