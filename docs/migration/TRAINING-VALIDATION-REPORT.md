# Relatório de validação da fundação de treino

- **Tipo:** Migração.
- **Área:** Treino.
- **Tarefas relacionadas:** [E02-T01](../../roadmap/epics/E02-nutrition-data-migration/T01-inventory-nutrition-inputs.md).

## Resultado

- Data do gate: `2026-09-01`.
- Resultado da árvore candidata: `PASS`.
- Falhas abertas: `0`.
- Base do destino: `95dc4cd30cdd265cb4b848eaf696e83299891703` em `developer`.
- Snapshot privado: `d1acad309e2b81b714d1aa375e9371a310ad6ed0`.
- Marco imutável: `training-foundation-v1`, aplicado ao commit integrado após o merge aprovado.

O gate confirma a fundação documental e os dados de treino. Não valida aplicação, banco, automação de CI, adequação clínica ou prescrição individual.

## Correções do gate

- `data/active.json` passou para a versão estrutural `1.1.0`.
- A referência ao treino original privado passou de caminho inexistente para o `artifact_id` auditável `e01-t03-coach-workout-2026-08`.
- O guia humano passou a apontar para `docs/guides/TRAINING-GUIDE.md`.
- O manifesto passou a classificar o ponteiro como `TRANSFORM`, preservando os hashes de origem e destino e a justificativa.
- O critério público de agenda deixou de reproduzir valores exatos e passou a validar somente a representação sanitizada.

## Matriz de validação

| Área | Evidência | Resultado |
| --- | --- | --- |
| Origem | Remote privado esperado, branch do snapshot e alvo efetivo da tag anotada resolvem para o commit registrado | `PASS` |
| Manifesto | 23 artefatos: 19 `VERIFIED`, 4 `SKIPPED` e nenhuma linha pendente | `PASS` |
| Hashes | 23 blobs de origem e 19 destinos conferidos; as 5 cópias literais mantêm equivalência SHA-256 | `PASS` |
| JSON | 9 arquivos fazem parse | `PASS` |
| Schemas | Biblioteca e dois planos aceitos pelos contratos Draft 2020-12 | `PASS` |
| IDs | 38 IDs de exercício únicos e 87 referências de plano resolvidas | `PASS` |
| Plano vigente | ID e caminho apontam para `performance_2026_08_v2`; revisão e guia existem | `PASS` |
| Original privado | Ponteiro e revisão usam o mesmo `artifact_id`, encerrado como `SKIP/DO_NOT_PUBLISH/SKIPPED` | `PASS` |
| Agenda | Quatro sessões públicas com dia, horário e intensidade nulos; dia e horário do jogo permanecem nulos | `PASS` |
| Fatos privados | As quatro sessões confirmadas foram confrontadas diretamente no snapshot sem publicar seus valores | `PASS` |
| Documentação | Links relativos resolvem, 48 IDs de tarefa são únicos e as dependências não possuem ciclos | `PASS` |
| Exposição | Árvore atual sem valores exatos de agenda, caminhos locais absolutos ou padrões comuns de segredo | `PASS` |
| Escopo | Nenhuma aplicação, script, dependência, banco ou workflow introduzido | `PASS` |
| Git | Uma única tarefa `IN_PROGRESS` durante o gate e `git diff --check` sem erros | `PASS` |

## Decisões semânticas

`data/active.json` é a única fonte canônica para selecionar o plano vigente. O `status: active` preservado na v1 é metadado histórico do arquivo literal e não cria um segundo ponteiro vigente.

O treino original do coach continua somente no snapshot privado. Sua ausência física no destino é intencional; consumidores devem resolver sua proveniência pelo manifesto, nunca montar um caminho local para o conteúdo excluído.

## Privacidade

O proprietário aceitou manter o histórico Git público anterior e sanitizar a árvore vigente, sem reescrita. Essa decisão foi registrada na política pública e não autoriza novas publicações de agenda pessoal.

O relatório não reproduz dias ou horários privados. A conferência foi feita diretamente no blob do snapshot registrado.

## Limitações conhecidas

- Ainda não há schemas para perfil, agenda, ponteiro ativo ou revisões.
- Os schemas atuais são permissivos e não substituem validações cruzadas.
- A automação dessas invariantes pertence ao futuro check `Data integrity`.
- Não há CI executável nesta fase documental, conforme a governança do projeto.

Essas limitações já estão documentadas e não invalidam a migração concluída.

## Conclusão

A fundação de treino é íntegra, reproduzível e compatível com a política do repositório público. Não há falhas abertas que impeçam o início de `E02-T01` após a publicação do marco imutável.
