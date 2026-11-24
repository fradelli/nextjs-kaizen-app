# Relatório de validação da fundação alimentar

- **Tipo:** Migração.
- **Área:** Alimentação.
- **Tarefas relacionadas:** [E02-T06](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E02-nutrition-data-migration/T06-validate-nutrition-foundation.md), [E03-T01](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E03-product-and-architecture/T01-define-p0-journeys.md).

## Resultado

- Tarefa: `E02-T06`
- Data: 2026-09-02
- Base validada: `developer@0872f307fe29f1c073ddae53d4151d3c6960300d`
- Resultado do gate: `PASS`
- Falhas bloqueantes: nenhuma
- Próxima tarefa liberada: `E03-T01`
- Tag de encerramento: `nutrition-foundation-v1`, criada após o merge desta entrega e apontada para o commit resultante em `developer`

O plano `nutrition_2026_09_personal_v1` pode ser localizado, validado estruturalmente e interpretado por consumidor read-only. A aprovação é para uso pessoal; o status profissional permanece `not_validated`.

## Escopo verificado

- snapshot e revisão privados registrados por commits imutáveis;
- manifesto público e hashes das fontes e dos derivados;
- metadados sanitizados da revisão;
- plano alimentar aprovado e versionado;
- ponteiro ativo, JSON Schema e guia humano derivado;
- relação com o plano de treino ativo;
- links relativos, privacidade e estado do roadmap.

## Evidências

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| Parse de JSON | `PASS` | 13 arquivos JSON válidos |
| JSON Schema | `PASS` | plano ativo aceito por `schemas/nutrition-plan.schema.json` |
| Ponteiro alimentar | `PASS` | caminho resolve e `active_plan_id` coincide com o plano |
| Estrutura do domínio | `PASS` | 6 tipos de dia, 5 refeições, 20 opções e 5 regras de horário |
| Referências cruzadas | `PASS` | faixas, refeições, opções e `reference_option` resolvidas |
| Relação com treino | `PASS` | proveniência aponta para `performance_2026_08_v2`, que é o plano de treino ativo |
| Manifesto E02 | `PASS` | 13 artefatos: 3 `VERIFIED/PUBLIC` e 10 `SKIPPED/DO_NOT_PUBLISH` |
| Integridade da origem | `PASS` | 13 hashes SHA-256 recalculados diretamente dos blobs privados |
| Integridade do destino | `PASS` | 3 hashes SHA-256 recalculados dos blobs versionados públicos |
| Referências privadas remotas | `PASS` | branch do snapshot, tag do snapshot e branch da revisão resolvidas no remote |
| Separação das camadas | `PASS` | nenhuma pasta de fontes privadas existe em `data/nutrition/source/` no Kaizen |
| Unknowns e segurança | `PASS` | campos desconhecidos continuam `null`; uso não clínico permanece explícito |
| Metadados da revisão | `PASS` | não expõem alimentos, refeições, quantidades, medidas, detalhes médicos ou caminhos históricos |
| Privacidade | `PASS` | nenhuma credencial, contato, caminho local ou identificador pessoal encontrado no escopo público E02 |
| Documentação | `PASS` | 90 arquivos Markdown examinados, sem link relativo quebrado |
| Guia derivado | `PASS` | identifica o plano ativo e declara a precedência do JSON |
| Tag pública antes do merge | `PASS` | nome disponível; criação adiada deliberadamente para o commit mesclado |
| Higiene Git | `PASS` | `git diff --check` sem erro |

## Comandos reproduzíveis

Os comandos foram executados no PowerShell 7 a partir da raiz do `kaizen-app`.

```powershell
Get-ChildItem -Recurse -File -Filter *.json |
  ForEach-Object { $null = Get-Content -Raw $_.FullName | ConvertFrom-Json -Depth 100 }

Get-Content -Raw data/nutrition/plans/2026-09-personal-v1.json |
  Test-Json -SchemaFile schemas/nutrition-plan.schema.json

$legacyRepo = (Resolve-Path ../personal-performance).Path
git -C $legacyRepo cat-file blob <source_commit>:<source_path>
git -C $legacyRepo ls-remote origin refs/heads/codex/E02-T02-freeze-nutrition-source 'refs/tags/kaizen-nutrition-source-v1^{}' refs/heads/codex/E02-T03-review-nutrition-plan

git cat-file blob HEAD:<destination_path>
git ls-remote origin refs/tags/nutrition-foundation-v1
git diff --check
```

Os bytes retornados por `git cat-file` foram processados em memória com SHA-256 e comparados às 13 linhas E02 do manifesto. O mesmo procedimento foi usado nos três destinos públicos, evitando diferenças de quebra de linha do worktree.

Também foram executadas verificações em memória para:

- coincidência entre ponteiro e `plan_id`;
- unicidade dos IDs de refeições e opções;
- existência das faixas, refeições e opções referenciadas;
- validade dos intervalos de energia e módulos;
- resolução de `reference_option`;
- manutenção dos oito `unknowns` como `null`;
- ausência de fontes privadas no destino;
- resolução de links relativos e varredura de padrões sensíveis.

## Proveniência e separação

O original alimentar e a alimentação praticada permanecem no snapshot privado `0d6456a68329f51fb9f83e1230cb285fe82f5996`. A revisão completa permanece no commit privado `35decd378d29e880ffcc1a0361af31e1b2083173`. Nenhum desses conteúdos foi copiado literalmente para o repositório público.

O Kaizen publica somente:

1. metadados e resumo sanitizados da revisão;
2. o plano transformado após aprovação explícita;
3. contratos e documentação nativos que derivam desse plano.

O manifesto continua sendo a allowlist da migração. Os dez artefatos privados E02 permanecem `SKIP/DO_NOT_PUBLISH`; a aprovação do plano não amplia a exposição das fontes.

## Limitações aceitas

- O schema confirma estrutura mínima, não adequação nutricional, clínica ou semântica.
- Faixas energéticas foram aprovadas pelo proprietário a partir do legado, mas não estão calibradas profissionalmente.
- Metas pessoais de macronutrientes, hidratação e horário do jogo continuam desconhecidas.
- A fundação ainda não registra cumprimento, substituições ou comentários; isso pertence às jornadas e à implementação do MVP.
- A tag é uma referência Git externa ao conteúdo do relatório. Sua existência e seu alvo devem ser confirmados imediatamente após o merge.

## Procedimento de encerramento

Após a aprovação e o squash merge desta tarefa em `developer`:

```powershell
git checkout developer
git pull --ff-only origin developer
git tag -a nutrition-foundation-v1 -m "E02 nutrition foundation validated"
git push origin nutrition-foundation-v1
git ls-remote origin 'refs/tags/nutrition-foundation-v1^{}'
git rev-parse HEAD
```

Os dois últimos comandos devem retornar o mesmo commit. A tag não deve apontar para a branch temporária.
