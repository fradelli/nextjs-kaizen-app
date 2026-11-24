# Publicação do plano alimentar pessoal

- **Tipo:** Decisão.
- **Área:** Alimentação.
- **Tarefas relacionadas:** [E02-T04](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E02-nutrition-data-migration/T04-structure-nutrition-plan.md), [E02-T05](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E02-nutrition-data-migration/T05-create-nutrition-contracts.md).

## Status

- Data: 2026-09-02
- Decisão: aprovada pelo proprietário
- Tarefa: `E02-T04`
- Artefato: `data/nutrition/plans/2026-09-personal-v1.json`
- Exposição: `PUBLIC`

## Decisão

O proprietário confirmou que o legado privado representa sua alimentação vigente e autorizou a publicação de um derivado sanitizado contendo:

- alimentos familiares e disponíveis;
- modelo por tipo de dia;
- faixas energéticas existentes no plano legado;
- horários e janelas já registrados;
- quantidades confirmadas;
- múltiplas opções por refeição;
- campos ausentes como `null`.

A aprovação permite o uso operacional pessoal e a exposição pública do derivado. Ela não transforma o conteúdo em validação profissional nem autoriza inferir metas ausentes.

## Limites

O artefato público não contém identidade, contato, contexto médico, caminhos históricos, suplementos, protocolo cognitivo ou valores pessoais calculados sem confirmação. O documento original, o relato integral, a revisão privada e os demais artefatos continuam `DO_NOT_PUBLISH`.

O plano separa `lifecycle_status: approved_for_personal_use` de `professional_status: not_validated`. Alterações materiais devem criar uma nova versão e preservar o histórico.

## Consequência

`E02-T04` pode publicar o plano transformado. `E02-T05` deve criar o ponteiro ativo, o schema e o guia sem ampliar o conteúdo aprovado.
