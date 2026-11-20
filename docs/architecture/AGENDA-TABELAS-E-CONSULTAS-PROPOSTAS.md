# Agenda — tabelas, integridade e consultas propostas

Proposta técnica de 17/11/2026 para revisão. Baseada nas [regras aprovadas](../product/telas/agenda-regras-de-produto.md) e no [mapa de refatoração](../implementation/MAPA-DE-REFATORACAO-DA-AGENDA.md). Esta entrega especifica o desenho físico. A implementação deve validar as constraints com PostgreSQL e medir os planos de consulta.

O banco local foi iniciado e consultado em modo de leitura. Sua última migration aplicada é 20261115230000_sport_catalog. A migration 20261117010000_workout_plan_prescriptions está no checkout e ainda não consta aplicada. Coordenar a chave de integração com esse trabalho antes da migration da agenda.

## Tabelas do primeiro percurso

Entidades mutáveis usam UUID, workspace_id, created_at, updated_at e revision inteiro. Registros históricos são imutáveis, com recorded_at e número da revisão de origem. Cada tabela expõe UNIQUE(workspace_id, id). FKs operacionais compostas incluem workspace_id. O workspace vem do servidor. Exclusões de entidades referenciadas usam RESTRICT e o arquivamento mantém as referências.

| Tabela proposta | Campos específicos e finalidade |
|---|---|
| agenda_tag | name, color_key, system_key nullable, archived_at. UNIQUE(workspace_id, system_key) para Treino e Alimentação. color_key referencia uma opção da paleta exportada pelo design system. Proteção dos nomes padrão e de sua exclusão no caso de uso. |
| todo_list | name, color_key nullable, sort_order, archived_at. Cor nula representa lista neutra. |
| todo | list_id, title, estimated_minutes nullable, completed_at nullable, archived_at. Estimativa positiva e múltipla de 15. Reserva e registro de tempo referenciam o mesmo to-do. |
| agenda_activity | title, tag_id nullable, parent_activity_id nullable, starts_at/ends_at nullable, scheduled_date nullable, timezone, removed_at. Possui exatamente intervalo ou data sem horário. Atividade interna usa esta mesma tabela. |
| todo_reservation | todo_id, parent_activity_id nullable, placement_version_id, starts_at, ends_at, removed_at. O intervalo é consultável independentemente do pai. A conclusão pertence ao destino da tarefa. occurrence_id entra no incremento de recorrência junto com sua FK. |
| todo_placement_version | todo_id, effective_from, list_id, color_key snapshot. Histórico das trocas de lista, uma versão inicial e versões seguintes por mudança. UNIQUE(workspace_id, todo_id, effective_from). |
| agenda_activity_revision | activity_id, revision_number, recorded_at, dados explícitos de título, intervalo/data, tag, cor resolvida, pai e remoção. UNIQUE(workspace_id, activity_id, revision_number). Preserva o estado anterior às correções. |
| todo_reservation_revision | reservation_id, revision_number, recorded_at, intervalo, pai, versão de classificação e remoção. Mesma unicidade por revisão. Permite recuperar o vínculo anterior mesmo após desvinculação. |

As tabelas de revisão são histórico escrito na mesma transação da alteração. A consulta normal usa a linha atual. As revisões atendem à leitura histórica e às correções intencionais, sem reconstruir toda a agenda em cada abertura. Quando o usuário exclui Trabalho e mantém itens, atualizar explicitamente os vínculos antes de marcar Trabalho como removido.

Para cores, a precedência operacional é pai vinculado, lista do to-do e neutro. A alteração de lista cria uma nova versão de classificação e encerra a herança anterior nas reservas futuras, conforme a escolha aprovada. Congelar a cor histórica ao alterar sua fonte permite preservar reservas encerradas mesmo quando o usuário depois edita a paleta ou arquiva a lista.

**Decisão aprovada:** para uma reserva já iniciada no instante da troca de lista, conservar sua cor e vínculo atuais até o fim. Aplicar a nova classificação quando starts_at for maior ou igual ao instante da troca. Isso dá uma fronteira precisa e evita mudar retrospectivamente uma reserva em andamento.

## Datas, vínculos e ocupação

Intervalos usam timestamptz e comparação semiaberta [início, fim). Uma reserva que termina às 10h permite outra começar às 10h. Validar início e fim com segundos zerados e minutos 00, 15, 30 ou 45 no fuso do produto. O fim tem data própria e deve ser posterior ao início. scheduled_date usa date e serve à faixa sem horário. Todo sem agendamento fica somente na lista.

Parent_activity_id pode existir mesmo com reserva fora do intervalo do pai. A condição de desenhar dentro depende do vínculo e da contenção completa. Inserir uma nova reserva dentro exige espaço livre. Uma reserva externa que mantém vínculo participa da consulta por pai para movimento e exclusão, mas sua posição no calendário vem de seu próprio intervalo.

Impedir uma atividade de ser pai de si mesma e impedir ciclos. A verificação de ancestralidade ocorre sob bloqueio transacional. Profundidade visual além de um nível segue pendente de produto; o esquema não transforma profundidade em categoria diferente de atividade.

Para validar conflito interno, consultar a união de reservas ativas e atividades filhas efetivamente contidas no mesmo pai. Não criar constraint de exclusão global por tag ou horário. Dois blocos independentes podem coincidir. Pausas internas precisam de representação e regras aprovadas antes de ativar o cálculo de espaço livre com intervalo de almoço; a sugestão anterior de pausa não define, sozinha, uma tabela de pausa.

## Recorrência e projeção

O segundo incremento acrescenta regras tipadas para atividades e to-dos. Cada regra tem identidade estável, timezone e versões com vigência. Cada versão registra dias da semana, início da vigência e término opcional. Uma ocorrência tem chave única (workspace_id, series_id, original_date). Remarcar conserva original_date e altera a data efetiva. A versão da prescrição fica referenciada separadamente da identidade da série.

| Tabela candidata | Responsabilidade |
|---|---|
| todo_series e todo_series_version | Programação e versões de um to-do recorrente. |
| todo_occurrence | Estado de conclusão/cancelamento e data efetiva da ocorrência, persistido quando há interação. UNIQUE(workspace_id, series_id, original_date). |
| activity_series e activity_series_version | Programação de atividades comuns. A ocorrência materializada usa agenda_activity, com série e data original únicas. |
| agenda_activity com origem de série | A própria ocorrência materializada guarda a exceção, cancelamento ou remarcação, com identidade original e intervalo efetivo indexado. Evitar uma segunda tabela com o mesmo estado atual de horário. |
| time_entry | Duração real positiva em segundos, data realizada, revisão e exatamente um destino entre atividade, to-do único ou ocorrência de to-do. Identidade única evita dupla contagem. |

Uma reserva recorrente deve referenciar ocorrência do próprio to-do. Garantir por FK composta incluindo todo_id. Um to-do recorrente usa completed_at da ocorrência. O estado de conclusão único da tabela todo aplica-se às tarefas únicas. A conversão entre tarefa única e recorrente ainda exige regra de produto.

Projetar somente o intervalo solicitado. Sobrescrever a projeção com exceções por identidade original e incluir exceções cujo destino entra no intervalo, mesmo que a origem esteja fora. Ao editar “Esta e as próximas”, fechar a vigência anterior e abrir a nova versão atomicamente, preservando exceções personalizadas. Uma programação sem fim gera apenas as ocorrências necessárias à consulta.

Dias passados são persistidos por um processo idempotente por workspace e data com checkpoint, inclusive para dias em que o app não abriu. As versões imutáveis de programação permitem recuperar a prescrição correspondente ao dia durante essa captura. Executar a captura pendente antes de uma edição que possa afetar o passado. A consulta semanal usa as ocorrências persistidas e projeta as ainda não capturadas a partir das versões históricas. Leituras não criam cópias diárias.

## Consultas e índices

| Consulta | Predicado e índice candidato |
|---|---|
| Semana ou dia de atividades | workspace_id = W, removed_at IS NULL e tstzrange(starts_at, ends_at, '[)') && tstzrange(início, fim, '[)'). Índice GiST parcial sobre a mesma expressão, somente para intervalos ativos e completos; combinar workspace com btree_gist se o plano medido justificar. |
| Reservas na janela | Mesmo predicado sobre todo_reservation. Buscar primeiro as reservas pelo intervalo, depois seus pais e tarefas em lote. |
| Faixa sem horário | B-tree parcial (workspace_id, scheduled_date, id) para atividades ativas com data definida. |
| Itens vinculados para mover/excluir | B-tree parcial (workspace_id, parent_activity_id, id) nas atividades e reservas ativas. Inclui filhos fora do horário do pai. |
| To-dos da lista | B-tree parcial (workspace_id, list_id, id) sobre ativos. Paginação por chave, carregando apenas a página da lista aberta. Acrescentar ordenação persistida quando a UX de reordenação for definida. |
| Reservas do mesmo to-do | B-tree (workspace_id, todo_id, starts_at, id). Permite localizar futuras e representações a atualizar após conclusão. |
| Histórico e classificação | Índices únicos por revisão e (workspace_id, todo_id, effective_from). Buscar a versão aplicável com limite de uma linha por item, em lote. |

GiST acelera consultas de interseção de intervalos. É uma escolha candidata a medir com volume representativo. Evitar criar simultaneamente vários índices concorrentes para a mesma leitura antes de avaliar EXPLAIN (ANALYZE, BUFFERS). A operação de overlap sobre intervalo permite encontrar o bloco iniciado antes da semana e terminado dentro dela. [PostgreSQL — range types](https://www.postgresql.org/docs/current/rangetypes.html)

O DTO da grade contém identidade, origem, intervalo/data, vínculo, cor e estado necessários à apresentação. Detalhes de execução são carregados ao abrir o executor. Buscar tarefas, pais e cores em lotes evita uma consulta por card. Manter o cache de dias no cliente e invalidar dias de origem/destino, inclusive dias cobertos por intervalos multidia. Uma revisão do conjunto de dados permite detectar resposta de leitura anterior a uma mutação.

## Transações

Reservar bloqueia o pai antes de consultar irmãos, valida a revisão e o espaço e insere a reserva. Todo escritor que adiciona, move ou retira filhos segue esse protocolo. Para trocar de pai, bloquear pais em ordem estável de UUID. Alterações de classificação também bloqueiam o to-do antes de selecionar reservas afetadas. A revisão apresentada no diálogo permite detectar itens adicionados após a prévia e reapresentar o conjunto em vez de excluir um item que o usuário nunca viu.

Movimento, exclusão, vínculo e snapshot de histórico são gravados atomicamente. A consulta do pai sob lock evita duas reservas simultâneas ocuparem a mesma lacuna. Para vinculações entre atividades, serializar mudanças da hierarquia por workspace com lock específico durante a verificação de ciclos; o custo é restrito à mudança de hierarquia. Bloqueios de linhas e sua ordem precisam ser iguais entre os casos de uso para reduzir deadlocks. [PostgreSQL — explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)

Usar ID de operação único por workspace nas mutações que criam registros. Gravar resultado junto da operação permite devolver o mesmo resultado se a resposta se perder e o cliente repetir. Concluir define o estado desejado explicitamente, em vez de alternar sem saber o estado atual. Retry é limitado a falhas transitórias e conserva a chave de operação.

## Ajustes da revisão de integridade

Revisão estática concluída em 17/11. Os pontos abaixo completam os contratos que a migration e os casos de uso precisam cumprir.

- **Cor histórica.** placement_version_id é uma FK explícita da reserva, com todo_id na chave referenciada. Cor do pai exige versões da classificação visual do pai com início de vigência e color_key resolvido. Ao encerrar a reserva, sua aparência é obtida da versão vigente no encerramento. Alterar uma tag deve registrar a versão anterior da cor de cada pai afetado, atomicamente, ou manter versões da própria tag e consultá-las pela data histórica. Escolha técnica proposta: versionar tag e lista, evitando regravar todos os cards ao editar a paleta. Acrescentar agenda_tag_version e todo_list_version. O snapshot da reserva guarda a fonte e sua versão para correções futuras. A simples existência de revisions de reserva não preserva cores quando somente a tag muda.
- **Conclusão histórica.** Acrescentar todo_revision para alterações de título, lista, conclusão e arquivamento. Para recorrência, adicionar histórico equivalente da ocorrência. Registros de tempo precisam de revisões para correção e reatribuição explícitas.
- **Revisão do conjunto.** Toda inserção, remoção ou alteração de filho incrementa a revision do pai na mesma transação, inclusive filhos fora do intervalo. A prévia de exclusão envia essa revisão. Sem esse incremento, bloquear a linha do pai não detecta filhos incluídos depois de o usuário abrir o diálogo.
- **Ordem de locks.** Operações com to-dos bloqueiam primeiro todos os to-dos afetados em ordem de UUID, depois os pais em ordem de UUID e depois as reservas. Exclusão de pai identifica os to-dos, adquire os locks nessa ordem e revalida a lista de filhos e revisão do pai. Se surgiram novos participantes, desfaz e recompõe a transação. Mudanças hierárquicas obtêm seu lock de hierarquia antes desses locks. Retentativas são limitadas.
- **Idempotência persistida.** Acrescentar agenda_mutation_receipt com workspace_id, operation_id, command_hash, resultado e created_at. UNIQUE(workspace_id, operation_id). Mesma chave com conteúdo diferente retorna conflito. Recibo e efeito são confirmados na mesma transação. Definir retenção antes de limpar recibos para não reexecutar uma criação antiga.
- **Constraints verificáveis.** CHECK de intervalo completo ou scheduled_date exclusivo; ends_at > starts_at; duração estimada positiva e múltipla de 15; duração real positiva; exatamente um destino de time_entry. FK composta impede pai de outro workspace. A exclusão lógica exige validar pai ativo sob lock, pois FK sozinha permite apontar para uma linha removida. A paleta precisa de catálogo estável de chaves aceitas, compartilhado com o design system.
- **Consulta consistente com índice.** O predicado deve usar a mesma expressão de range do índice GiST. Comparações isoladas de starts_at e ends_at não garantem uso desse índice. O filtro parcial exclui atividades sem horário; valores nulos em ranges podem representar limites abertos. Datas sem horário têm consulta própria e são combinadas ao resultado da semana.
- **Ocorrências que atravessam semanas.** Ao projetar uma série, considerar inícios anteriores à janela até a duração do bloco, além de exceções materializadas por intervalo efetivo. Uma atividade de cinco dias iniciada antes da segunda deve aparecer na semana. Edição de série deve preservar a identidade original e tombstones de cancelamento.
- **Histórico diário.** A persistência dos dias passados é uma decisão do usuário. Adicionar agenda_day_checkpoint por workspace e data e captura idempotente das ocorrências encerradas, com referência à versão de programação. Consulta semanal permanece leitura. Correções históricas criam revisão. Um bloco multidia mantém identidade única. Dimensionar retenção e execução em lotes, com retomada após dias sem execução do processo.
- **Cache.** Invalidar intervalo antigo e novo e todas as datas de reservas afetadas, mesmo fora do pai. Mudança de lista e cor atualiza todas as representações futuras carregadas. Guardar uma geração de requisição no cliente e descartar respostas anteriores à mutação, evitando restaurar dados obsoletos.

Restam decisões de produto que o esquema deve deixar identificáveis: tratamento de pausas e limite visual de aninhamento. Essas decisões não devem ser fixadas implicitamente por uma constraint. A implementação deve também definir se os rótulos e cores de atividades passadas seguem a mesma política de preservação já aprovada para reservas.

## Entrega e medição

Manter uma tabela de vínculo explícito entre ocorrência de agenda e ocorrência executável de treino, com FK para a identidade efetivamente escolhida após estabilizar os planos. O executor continua a possuir séries, carga, confirmação e descanso. O recorte inicial entrega atividades comuns e to-dos com a grade lendo as duas origens. Dieta fica para seu contrato próprio.

Primeiro preparar migration aditiva com constraints e testes relacionais do percurso. Depois ligar lista, formulário de reserva e leitura da agenda. Só remover os escritores de agenda acoplados ao treino quando seus consumidores já estiverem migrados. Conferir qual migration de planos foi aplicada no momento real de executar esta etapa.

Medir em banco de teste com 1 mil, 10 mil e 100 mil reservas distribuídas por vários anos, tarefas com muitas reservas e blocos que atravessam semanas. Registrar tempo total, buffers, linhas examinadas, quantidade de consultas e tamanho do DTO para uma semana. Comparar latência p50/p95 de leitura quente e fria e medir mudança de lista e exclusão com centenas de vínculos. O objetivo é custo proporcional à janela e aos itens afetados. O primeiro benchmark estabelece o orçamento mensurável.

Testes obrigatórios incluem datas em meia-noite, duas inserções simultâneas na mesma lacuna, reenvio da mesma operação, ciclo indireto de pais, falha entre desvincular e excluir, exceção que muda de semana, troca de lista preservando história, reserva fora do pai e consulta após mudança de cor. Plano e índices ainda não foram executados nem medidos nesta entrega.
