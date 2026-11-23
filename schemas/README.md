# Schemas de dados

Os contratos usam JSON Schema Draft 2020-12. O $id sob https://example.local/
é identificador do contrato, não endpoint publicado. Validação estrutural não
comprova segurança clínica, eficácia ou adequação individual.

## Cobertura

| Schema                                                                             | Dados                                                                             | Garantias                                                          |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [exercise-library.schema.json](exercise-library.schema.json)                       | [data/exercises.json](../data/exercises.json)                                     | Estrutura da biblioteca, IDs snake_case e evidência                |
| [training-plan.schema.json](training-plan.schema.json)                             | [data/plans/](../data/plans)                                                     | Versão, status, sessões e estrutura de prescrição                  |
| [nutrition-plan.schema.json](nutrition-plan.schema.json)                           | [data/nutrition/plans/](../data/nutrition/plans)                                 | Aprovação, proveniência, tipos de dia, refeições, opções e limites |
| [training-execution-metadata.schema.json](training-execution-metadata.schema.json) | [data/training-execution-metadata.json](../data/training-execution-metadata.json) | Medição, carga, unidade, doses normalizadas e cobertura revisada   |

## Metadados de execução

O contrato novo é estrito (additionalProperties: false), sem defaults. Cada
exercício usado em qualquer plano versionado exige uma entrada revisada contendo
exercise_id, measurement_type, load_applicable, load_unit e normalization_rule.
reviewed_plan_paths lista exatamente os planos cobertos.

- Carga aplicável exige unidade kg; não aplicável exige null.
- Carga aplicável é possibilidade do contrato, não recomendação de adicioná-la.
- Cada prescrição mantém texto original, mínimo, máximo, unidade, escopo e qualifier.
- Minutos são normalizados em segundos; medidas por lado preservam sua unidade.
- Direções cervical/punho e qualifiers de aquecimento não são descartados.
- Biblioteca e planos históricos permanecem intactos; metadados os complementam.
- Nenhum dado operacional pessoal pertence ao arquivo versionado.

O [modelo P0](../docs/architecture/DATA-MODEL.md) documenta a revisão por exercício.
Categoria, nome e regex não determinam carga. A gramática do validador só verifica
normalizações explícitas já revisadas; dose desconhecida exige revisão, não fallback.

## Permissividade e limites

Os três contratos migrados preservam additionalProperties: true para campos
descritivos ainda não formalizados. O contrato dos metadados é fechado. Restringir
contrato legado exige dados de exemplo, impacto e migração explícitos.

Ainda não há schema inventariado para profile, schedule, ponteiros ativos,
reviews, manifesto, guias e templates. Seus JSONs passam por parse; ponteiros e
referências cobertos pelo validador têm checks semânticos próprios.

## Validação automatizada

```powershell
pnpm data:check
pnpm test:ci-scripts
```

[validate-data.mjs](../scripts/validate-data.mjs) habilita formatos e verifica:
parse/schema, unicidade de IDs, referências de exercícios, ponteiros ativos,
referências alimentares e cobertura/normalização dos metadados. Unicidade de
exercise_id entre objetos e existência de referências não são garantidas apenas
por JSON Schema. Ausência de classificação é erro bloqueante para a importação.

O job Data integrity já executa essas validações na CI. Os testes usam fixtures
sintéticas, não dados operacionais pessoais ou mock de banco pronto.
