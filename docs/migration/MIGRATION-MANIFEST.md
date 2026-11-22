# Manifesto de migração

- **Tipo:** Migração.
- **Área:** Migração.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

## Finalidade

Este manifesto é a allowlist dos artefatos que podem sair do legado privado. E01 registra a fundação de treino e E02 registra a fonte alimentar preservada, sempre a partir de snapshots fixados e sem usar o worktree como origem.

## Valores permitidos

### Tratamento

| Valor | Significado |
| --- | --- |
| `COPY` | Cópia literal dos bytes do artefato aprovado |
| `TRANSFORM` | Estrutura ou campos alterados com justificativa explícita |
| `SUMMARIZE` | Novo documento derivado que preserva somente informação aprovada |
| `SKIP` | Artefato inventariado, mas excluído da migração |

### Exposição

| Valor | Significado |
| --- | --- |
| `PUBLIC` | Aprovado para o repositório público |
| `REVIEW_REQUIRED` | Aguarda revisão ou sanitização específica |
| `DO_NOT_PUBLISH` | Deve permanecer apenas no legado privado |

### Status

| Valor | Significado |
| --- | --- |
| `PLANNED` | Inventariado, sem conteúdo criado no destino |
| `MIGRATED` | Conteúdo criado no destino e ainda não verificado |
| `VERIFIED` | Tratamento, exposição e integridade confirmados |
| `SKIPPED` | Encerrado sem conteúdo no destino |

## Campos

| Campo | Obrigatório | Regra |
| --- | --- | --- |
| `artifact_id` | Sim | ID estável em kebab-case |
| `source_repository` | Sim | Deve existir em `SOURCE-REPOSITORIES.md` |
| `source_commit` | Sim | SHA completo e imutável; nunca worktree |
| `source_path` | Sim | Caminho relativo ao repositório de origem |
| `source_sha256` | Para migração | `sha256:` seguido de 64 caracteres hexadecimais minúsculos |
| `destination_path` | Exceto `SKIP` | Caminho relativo ao `kaizen-app` |
| `destination_sha256` | Para `MIGRATED` ou `VERIFIED` | Hash dos bytes versionados no destino |
| `treatment` | Sim | `COPY`, `TRANSFORM`, `SUMMARIZE` ou `SKIP` |
| `exposure` | Sim | `PUBLIC`, `REVIEW_REQUIRED` ou `DO_NOT_PUBLISH` |
| `status` | Sim | `PLANNED`, `MIGRATED`, `VERIFIED` ou `SKIPPED` |
| `decision` | Sim | Motivo da seleção, transformação ou exclusão |
| `verified_at` | Para `VERIFIED` | Data ISO 8601 `YYYY-MM-DD` |

## Regras de integridade

- `COPY`: `source_sha256` e `destination_sha256` devem ser iguais.
- `TRANSFORM` e `SUMMARIZE`: os dois hashes são preservados e `decision` explica a diferença.
- `SKIP`: `destination_path` e `destination_sha256` são `null`.
- `REVIEW_REQUIRED` e `DO_NOT_PUBLISH` não podem avançar para `MIGRATED`.
- Um artefato não listado abaixo não está autorizado para migração.

## Artefatos

| artifact_id | source_repository | source_commit | source_path | source_sha256 | destination_path | destination_sha256 | treatment | exposure | status | decision | verified_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| e01-t02-active-plan-pointer | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | data/active.json | sha256:85ca7e6ab251fca5ad5baec95f31e5be38de09b6e318b997868c0e4da83e8873 | data/active.json | sha256:4c2e601278ff435e8381c949a4161c5b9fb5e9696b2da548e7066ca142bff9e9 | TRANSFORM | PUBLIC | VERIFIED | Ponteiro adaptado para referenciar o original privado pelo `artifact_id`, corrigir o caminho do guia público e versionar a mudança estrutural sem alterar o plano vigente | 2026-09-01 |
| e01-t02-exercise-library | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | data/exercises.json | sha256:121147a19982d168ad02b91c09f86365aac7d52beb787ebb7e61f385edf1cfb7 | data/exercises.json | sha256:121147a19982d168ad02b91c09f86365aac7d52beb787ebb7e61f385edf1cfb7 | COPY | PUBLIC | VERIFIED | Cópia literal aprovada da biblioteca canônica com IDs estáveis | 2026-08-31 |
| e01-t02-profile | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | data/profile.json | sha256:334e1c0811ab40a956fa2006e23b9a777ebbde474a8203aeab9ab7515e31a85d | data/profile.json | sha256:b3a6f0191f3501d5006add3ba34afcdb8e1d852bdd95fc8da3240642b06c751d | TRANSFORM | PUBLIC | VERIFIED | Exposição aprovada com identidade e medidas nulas, contexto de saúde removido e `unknowns` médicos excluídos | 2026-08-31 |
| e01-t02-schedule | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | data/schedule.json | sha256:11d9cf3b8ef03ecda956ffe4836a20132ae2fe8e89f0fb8fff1a7972e66dbe1a | data/schedule.json | sha256:616b0541bef90781cbd0c3a0da872c1c5a69728569b7a0d44533b5c210a512f2 | TRANSFORM | PUBLIC | VERIFIED | Exposição aprovada com dias e horários anulados, modelos semanais removidos e regras de distribuição preservadas | 2026-08-31 |
| e01-t02-active-plan-v2 | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | data/plans/2026-08-performance-v2.json | sha256:3efe7b0de79456d20b4f8a0d3b2d4690afe6676814c67ca11c841179887a26de | data/plans/2026-08-performance-v2.json | sha256:3efe7b0de79456d20b4f8a0d3b2d4690afe6676814c67ca11c841179887a26de | COPY | PUBLIC | VERIFIED | Cópia literal e publicação integral do plano vigente aprovadas pelo proprietário | 2026-08-31 |
| e01-t03-plan-v1 | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | data/plans/2026-08-performance-v1.json | sha256:fa3e6c6ec51bce78e883582b456c4861f7fb645106e7bf46f16406176d0a7b2d | data/plans/2026-08-performance-v1.json | sha256:fa3e6c6ec51bce78e883582b456c4861f7fb645106e7bf46f16406176d0a7b2d | COPY | PUBLIC | VERIFIED | Cópia literal aprovada como versão histórica; o `status` embutido foi preservado e não redefine o ponteiro ativo | 2026-08-31 |
| e01-t03-coach-workout-2026-08 | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | data/coach-workouts/2026-08-original.json | sha256:50bee0663e5319d9404e7663f37744931663a3de0f6e7c48bd5c50b842caa7da | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Original de terceiro preservado byte a byte somente no snapshot privado; publicação não autorizada | null |
| e01-t03-review-2026-08 | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | data/reviews/2026-08-review.json | sha256:4914015e9e1cfe6f726b28d2dcba8fe0c0a2814b15bd786aed95b6576fe74694 | data/reviews/2026-08-review.json | sha256:8099c1f71db4ee9d861f301f1627f71c1f605ef4845100ea5efba1db00095e7f | TRANSFORM | PUBLIC | VERIFIED | Referência ao caminho privado substituída pelo `artifact_id` auditável do treino original | 2026-08-31 |
| e01-t03-history-2026-08 | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | docs/history/2026-08-analise-inicial.md | sha256:215ac10d8d028c63ff5e82bc493c3f2d483e0f9cfdea855acbd47f71d5b97387 | docs/history/2026-08-analise-inicial.md | sha256:045badbdb74b45a3c842ffeacafefa646751d0bc7bd995f708208cdf801ccc46 | TRANSFORM | PUBLIC | VERIFIED | Link ao original privado, agenda exata e questão de saúde removidos; contexto de carga agregado e proveniência preservados | 2026-08-31 |
| e01-t04-training-rules | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | AGENTS.md | sha256:00c04325a44841e6f0c52b053c6eb4abfd375b2d916a7a92ae7ef14b45247fde | docs/guides/TRAINING-RULES.md | sha256:d74ed3d56de2cc20fe60e44496b32db024039a4654fa9221428b951412f6e6cf | SUMMARIZE | PUBLIC | VERIFIED | Somente regras de domínio, precedência e segurança foram preservadas; governança e agenda exata do legado foram excluídas | 2026-09-01 |
| e01-t04-update-guide | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | docs/COMO-ATUALIZAR-COM-CODEX.md | sha256:3f43dbf1bac6c9eb881ba11a70ed20375b28808eb6562f00e510a07baab0178c | docs/guides/UPDATING-TRAINING-DATA.md | sha256:be876a8624f69b9daefd8eb42c2d6d66bde930d036f8cad5f682c29ba26bf2d9 | TRANSFORM | PUBLIC | VERIFIED | Fluxos e caminhos atualizados para o Kaizen público; prompts foram rotulados como exemplos não canônicos | 2026-09-01 |
| e01-t04-evidence-limits | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | docs/EVIDENCIAS-E-LIMITES.md | sha256:4d1a8d3d94fafcf914fd1b299579cd6d5414404c4cb634cfb311272f90250514 | docs/evidence/TRAINING-EVIDENCE-AND-LIMITS.md | sha256:dfb8dc9acf493f7d1f250dd56eca42ec33704f03a6c055660255655f14330d57 | TRANSFORM | PUBLIC | VERIFIED | Evidências, controvérsias e limites preservados com proveniência e sem contexto pessoal | 2026-09-01 |
| e01-t04-training-guide | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | docs/GUIA-DE-TREINO.md | sha256:45e7e2947977fba438bd619e16589732961439cb6ec29058c460a3f7e72fb7e9 | docs/guides/TRAINING-GUIDE.md | sha256:4a6aab5426e2ed4e6d8694f38c6c9892fc878b1d8f8ee7f91f6d9bd649d7ef21 | SUMMARIZE | PUBLIC | VERIFIED | Guia reduzido a navegação e regras derivadas; doses, exercícios, agenda e contexto pessoal não foram duplicados | 2026-09-01 |
| e01-t04-daily-summary | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | docs/RESUMO-DIARIO-DE-TREINO.md | sha256:83610c557fdfc3a7b22619fef5408f006da7ef0f8d10924dea9afb88e475af0a | docs/guides/DAILY-TRAINING-SUMMARY.md | sha256:7f3b6e1240d33f8928d20b34f4d1f11b39571a8da33d5e8699090ee38fddf6e8 | SUMMARIZE | PUBLIC | VERIFIED | Resumo convertido em seletor de sessões sem agenda, doses duplicadas ou contexto pessoal | 2026-09-01 |
| e01-t04-weekly-check-in-template | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | templates/CHECK-IN-SEMANAL.md | sha256:a2a9ac3b2f295c1a8e0f7c818c8ede150f8757e91c09b67ca47e2bb1986d84fa | templates/CHECK-IN-SEMANAL.md | sha256:8e68b277e73198399354fe5383638609f0a02f853b13a3f8e4853370673a9833 | TRANSFORM | PUBLIC | VERIFIED | Campos generalizados e aviso exige preenchimento privado sem versionar respostas ou saúde | 2026-09-01 |
| e01-t04-schedule-change-template | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | templates/MUDANCA-DE-HORARIOS.md | sha256:17e07df5f9b893a71aab14059398d009bee70f1672370aa1bedbb7de1bd65272 | templates/MUDANCA-DE-HORARIOS.md | sha256:a61ce64cd372ce0ee95ab4c955982e06f04054e66ba91913718be6d8d942bb18 | TRANSFORM | PUBLIC | VERIFIED | Tabela reduzida a janela genérica e aviso proíbe versionar agenda ou restrições preenchidas | 2026-09-01 |
| e01-t04-coach-workout-template | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | templates/NOVO-TREINO-DO-COACH.md | sha256:8cd278a5b762fb311b9dcaeaa22398dca6d1997c61b63c5fabda7a52fb39c15c | templates/NOVO-TREINO-DO-COACH.md | sha256:3baf99aeac1dc63c744c31d92492f8b5f607ddd4be0827dabf96e89ecbef19bd | TRANSFORM | PUBLIC | VERIFIED | Template vazio preservado com aviso `DO_NOT_PUBLISH` para qualquer instância preenchida | 2026-09-01 |
| e01-t04-legacy-prompt-plan | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | docs/PLANO-DE-TRABALHO-E-PROMPTS.md | sha256:882d7780b44cf00dd0c2fbe739f0cbea47d68bfc4339adc14cac16cc0967700d | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Planejamento e prompts do legado não são fonte canônica no Kaizen | null |
| e01-t04-legacy-app-roadmap | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | docs/ROADMAP-APP.md | sha256:e43ec1137784f95ed4929134e8a6b043ef6aa4152e6d2850ddd23947e17cf128 | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Arquitetura e roadmap antigos foram substituídos | null |
| e01-t05-schema-readme | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | schemas/README.md | sha256:6fcc32baee36d3114ca087c21be5bac3069efb95c008d59acc7b4e7ec36b2575 | schemas/README.md | sha256:e93913c9f012d6a57e68b7929db7315fccab889bd8d3e80fe0ab67ac925fcbed | TRANSFORM | PUBLIC | VERIFIED | Referência ao script excluído removida; cobertura, permissividade, comandos atuais e lacunas foram explicitados | 2026-09-01 |
| e01-t05-exercise-schema | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | schemas/exercise-library.schema.json | sha256:8de37248fcff132fa36d0b83a0fc7f0bfddf0d5c9a7410786fd844f750c05339 | schemas/exercise-library.schema.json | sha256:8de37248fcff132fa36d0b83a0fc7f0bfddf0d5c9a7410786fd844f750c05339 | COPY | PUBLIC | VERIFIED | Contrato estrutural da biblioteca copiado literalmente e validado contra os dados migrados | 2026-09-01 |
| e01-t05-training-plan-schema | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | schemas/training-plan.schema.json | sha256:423382e8668319f65ad1b83cecc79d8cac9de9b2007d343ac0bcd84398925e70 | schemas/training-plan.schema.json | sha256:423382e8668319f65ad1b83cecc79d8cac9de9b2007d343ac0bcd84398925e70 | COPY | PUBLIC | VERIFIED | Contrato estrutural dos planos copiado literalmente e validado contra v1 e v2 | 2026-09-01 |
| e01-skip-validation-script | personal-performance | d1acad309e2b81b714d1aa375e9371a310ad6ed0 | scripts/validate.ps1 | sha256:b0053f58715a00c21771f34e3ec0803836ea8d664a1e7becd4dcd8e6ede633f6 | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Código do legado permanece fora dos épicos documentais | null |
| e02-t02-source-context | personal-performance | 0d6456a68329f51fb9f83e1230cb285fe82f5996 | data/nutrition/source/e02/context.json | sha256:0ab7cda38f9d592ac173b1b2b2d12dc419c2fab6f4cb759726517f527e111830 | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Contexto privado preservado para revisão posterior; publicação não autorizada | null |
| e02-t02-current-intake | personal-performance | 0d6456a68329f51fb9f83e1230cb285fe82f5996 | data/nutrition/source/e02/current-intake.md | sha256:d25cbb7f2a5b59423e7df51ab1fa6e41c6143d50648df3337792eb8fa2f1b10e | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Registro privado da prática atual preservado sem exposição pública | null |
| e02-t02-original-json | personal-performance | 0d6456a68329f51fb9f83e1230cb285fe82f5996 | data/nutrition/source/e02/original-diet.json | sha256:7421e0fa8ef39d42910328e1aa540c9bfb325c634d53bef0fd591add53d42eb1 | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Fonte original estruturada preservada privadamente; publicação não autorizada | null |
| e02-t02-original-pdf | personal-performance | 0d6456a68329f51fb9f83e1230cb285fe82f5996 | data/nutrition/source/e02/original-diet.pdf | sha256:a84e1ebadf28e45a40b5922f509e83761f1bc2c96d5eabfb67ccb84904862ee1 | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Documento original preservado privadamente; conteúdo de terceiro não publicado | null |
| e02-t02-periodized-plan-v1 | personal-performance | 0d6456a68329f51fb9f83e1230cb285fe82f5996 | data/nutrition/source/e02/derived-plan-v1.json | sha256:50bc329418447026fa791e22c9c64f4bbb56f92a4754cc4e9550fa019155017f | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Plano derivado preservado como histórico e explicitamente não vigente até revisão | null |
| e02-t02-recipe-01 | personal-performance | 0d6456a68329f51fb9f83e1230cb285fe82f5996 | data/nutrition/source/e02/recipe-01.json | sha256:2e1f1681eaf45036c97ec7fe1365960573a8226d9d63c407cbd3a62e680aa057 | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Material complementar privado preservado sem autorização de publicação | null |
| e02-t02-legacy-audit | personal-performance | 0d6456a68329f51fb9f83e1230cb285fe82f5996 | data/nutrition/source/e02/legacy-audit.md | sha256:b14e5959bfab6305e35359eb02bc32542f9a916452648aab7c61a3fe43299abb | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Revisão histórica preservada para revalidação; conclusões não promovidas automaticamente | null |
| e02-t02-human-guide | personal-performance | 0d6456a68329f51fb9f83e1230cb285fe82f5996 | data/nutrition/source/e02/human-guide.md | sha256:3c210923480926fc495fec20d2279e3931516d50bbfeeee8b06bf8e5e2840185 | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Visão humana histórica preservada privadamente e sem status de plano vigente | null |
| e02-t03-private-structured-review | personal-performance | 35decd378d29e880ffcc1a0361af31e1b2083173 | data/nutrition/reviews/e02-t03-review.json | sha256:79cdf8ce9eeac1b89320dbe8509f06d11acae444ad6ad960c5204213921dd7f5 | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Revisão estruturada completa contém contexto privado e permanece somente na origem privada | null |
| e02-t03-public-review-metadata | personal-performance | 35decd378d29e880ffcc1a0361af31e1b2083173 | data/nutrition/reviews/e02-t03-review.json | sha256:79cdf8ce9eeac1b89320dbe8509f06d11acae444ad6ad960c5204213921dd7f5 | data/nutrition/reviews/e02-t03-review-metadata.json | sha256:0969dc72c7f7f3e088555ea71b79627e2b7842283e2587edc3caaff89caec592 | SUMMARIZE | PUBLIC | VERIFIED | Metadados preservam papéis, contagens, gates e proveniência sem alimentos, refeições, quantidades ou contexto pessoal | 2026-09-02 |
| e02-t03-private-human-review | personal-performance | 35decd378d29e880ffcc1a0361af31e1b2083173 | docs/historico/2026-09-revisao-alimentar-e02-t03.md | sha256:492ac1748474c8b0b90301cecd8ada9fa3ed5daf6f5edfa6a7df6b653e4bb692 | null | null | SKIP | DO_NOT_PUBLISH | SKIPPED | Resumo humano detalhado permanece privado por conter decisões derivadas do contexto alimentar | null |
| e02-t03-public-human-summary | personal-performance | 35decd378d29e880ffcc1a0361af31e1b2083173 | docs/historico/2026-09-revisao-alimentar-e02-t03.md | sha256:492ac1748474c8b0b90301cecd8ada9fa3ed5daf6f5edfa6a7df6b653e4bb692 | docs/history/2026-09-nutrition-review.md | sha256:3068be51021990ae67f63a0916fa3a7f429c9a69658a7ca8bd7fcab2cd14c51a | SUMMARIZE | PUBLIC | VERIFIED | Resumo público registra resultado, limites e gate sem reproduzir conteúdo alimentar privado | 2026-09-02 |
| e02-t04-approved-nutrition-plan-v1 | personal-performance | 0d6456a68329f51fb9f83e1230cb285fe82f5996 | data/nutrition/source/e02/derived-plan-v1.json | sha256:50bc329418447026fa791e22c9c64f4bbb56f92a4754cc4e9550fa019155017f | data/nutrition/plans/2026-09-personal-v1.json | sha256:eeb54d3ec85fbe332326bb6a2285bc07e86cd58b73a729749971acc33f1cda58 | TRANSFORM | PUBLIC | VERIFIED | Plano reconstruído após revisão e aprovação explícita: preserva rotina, tipos de dia, faixas energéticas, opções e quantidades rastreáveis; remove identidade, contexto médico, suplementos, protocolo cognitivo, caminhos privados e metas inferidas | 2026-09-02 |

O manifesto registra 36 artefatos: 22 estão `VERIFIED` no destino público e 14 estão encerrados como `SKIPPED`; nenhuma linha permanece pendente. As fontes alimentares detalhadas permanecem privadas; metadados, resumo sanitizado e o novo plano transformado possuem aprovação pública específica.
