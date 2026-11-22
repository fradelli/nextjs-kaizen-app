# Página de planos · experiência e primeira jornada

- **Tipo:** Produto.
- **Área:** Autoria de planos.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

Proposta de produto para implementação. Complementa o [modelo de treino](../../architecture/MODELO-DE-TREINO-PROPOSTO.md). A unidade de edição é o plano do workspace. A unidade de prescrição é a série de um exercício.

## 1. Entrar, escolher e administrar

Entrada proposta: **Planos** na navegação principal, rota /plans. A lista abre mesmo sem plano ativo. Com lista vazia, apresenta “Criar plano”. Com dados, apresenta primeiro o ativo, depois os demais disponíveis; “Arquivados” abre a lista recolhida. Cada linha mostra nome, quantidade de treinos, estado e ação “Abrir”. Abrir ou criar um plano mantém o plano ativo atual.

| Ação | Resultado esperado |
|---|---|
| Criar | Abrir editor com foco em “Nome do plano”. A primeira gravação cria um plano disponível e retorna seu endereço permanente. |
| Abrir e editar | Abrir em leitura. “Editar” inicia uma cópia de trabalho baseada na revisão exibida. Cancelar volta à leitura; sair com mudanças pede confirmação. |
| Duplicar | Criar plano disponível com nome editável, mesma composição e vínculos independentes. Os vínculos podem apontar para a mesma revisão imutável. Agenda de ocorrências concretas, resultados e notas pessoais ficam no original. |
| Tornar ativo | Exibir qual plano será substituído. Confirmar troca o ativo em uma transação por workspace. A agenda resolve o novo plano nas próximas datas; ocorrências iniciadas ou concluídas preservam sua origem. Datas com exceções manuais precisam ser reconciliadas antes da integração da agenda. |
| Arquivar | Retirar da lista principal, manter consulta histórica. Para arquivar o ativo, oferecer escolher sucessor ou confirmar que ficará sem plano ativo. Restaurar retorna o plano à lista disponível. |

A página precisa incluir os planos importados já disponíveis no workspace. Ao editar uma prescrição importada, a gravação cria uma revisão operacional. A importação de um mesmo commit preserva a escolha ativa e as revisões do usuário.

## 2. Montar o treino

No editor, o nome do plano e a lista ordenada de treinos ficam no primeiro nível. “Adicionar treino” oferece criar um treino ou incluir uma sessão existente. O treino abre com nome e blocos. Um exercício avulso entra num bloco simples implícito. “Adicionar bloco” permite nomear e configurar preparação, alternância ou circuito. A interface mostra grupos explícitos quando ajudam a entender a ordem de execução.

Dentro do bloco, “Adicionar exercício” abre busca no catálogo. Selecionar o exercício define as medidas pertinentes. “Adicionar série” insere uma linha editável. A linha anterior pode fornecer valores iniciais de prescrição. Cada linha mantém identidade própria ao mudar de posição. Ações de mover para cima/baixo também funcionam por teclado. Remover um exercício com séries mostra o que será removido.

| Ordem | Tipo | Dose prescrita | Carga prevista | Descanso |
|---|---|---|---|---|
| 1 | Aquecimento | 10 repetições | 20 kg | 45 s |
| 2 | Trabalho | 12 repetições | 40 kg | 90 s |
| 3 | Trabalho | 8 repetições | 50 kg | 120 s |

Para drop set, “Adicionar etapa” cria outra dose e carga dentro da mesma linha de série. Há um descanso ao final do conjunto. Para unilateral, rotular kg por lado e permitir doses distintas à esquerda e à direita. Para medida por tempo ou direção, trocar rótulos e campos conforme o contrato do movimento. Campo de carga inaplicável fica oculto. Carga alvo em branco admite decisão na execução; 0 kg é um alvo explícito. No celular, expandir uma série por vez, preservando o resumo e a ordem das demais.

## 3. Editar com segurança

- Antes de iniciar um treino, salvar o editor publica a composição inteira atomicamente. Se outra edição mudou a revisão, manter as entradas e oferecer conferir a nova versão.
- Enquanto houver treino em andamento ou pausado, Planos permanece consultável. Desabilitar mutações com a mensagem “Finalize ou descarte o treino em andamento para editar o plano” e um atalho de retomada. Conferir o bloqueio também no servidor ao salvar, inclusive se a edição começou antes do treino.
- No executor, toda alteração de prescrição pede “Somente neste treino” ou “Neste e nos próximos”. Cancelar preserva os valores anteriores. Informar carga e dose realizadas integra o registro da execução.
- O histórico mostra prescrição inicial, composição adaptada e resultado. Renomear, arquivar e trocar o plano ativo preservam as referências usadas pelas ocorrências concluídas.

## 4. Primeira entrega vertical

**Cenário de aceite:** criar “Força na areia”, adicionar “Força A”, incluir agachamento e prescrever as três linhas da tabela. Salvar, sair para a lista, recarregar, abrir o plano por sua URL e conferir ordem, tipos, doses, cargas e descansos. Editar somente o descanso da segunda linha para 75 s. Reabrir e verificar 45/75/120 s. Repetir o envio de criação deve retornar o mesmo plano.

| Ordem | Trabalho | Verificação para avançar |
|---|---|---|
| 1 | Implementar plano do workspace, vínculo de treino e primeira revisão com bloco, exercício, série e etapa. Usar o catálogo existente e importar uma definição reproduzível. | Banco vazio reconstruído a partir do repositório permite selecionar agachamento. |
| 2 | Implementar leitura da lista/detalhe e comando transacional de criação/edição com chave idempotente, revisão esperada e workspace resolvido no servidor. | Falha na terceira série não deixa plano parcialmente salvo. Duas edições concorrentes não se sobrescrevem. |
| 3 | Implementar editor e navegação com as exportações Mira instaladas: Button e PendingButton para ações, Field/Input e NativeSelect para prescrição, Card e Accordion para agrupamento, Dialog para seleção e AlertDialog para descarte. Usar traduções pt/en, foco após inserção/erro e retorno ao acionador. | Completar o cenário de aceite em desktop e celular, também via teclado. |
| 4 | Conectar início, pausa e encerramento do executor ao bloqueio durável. O rascunho atual vive no navegador. Uma consulta isolada ao banco hoje não identifica todo treino ativo. | Abrir o editor numa aba e iniciar treino em outra impede o salvamento, inclusive por requisição direta. |
| 5 | Integrar os comandos de duplicação, arquivo e ativação à agenda. Hoje o leitor procura PlanActivation por ambiente. Definir uma única resolução do plano ativo por workspace e adaptar o leitor antes de disponibilizar a ação. | Ativar B muda a prévia futura; consultar um treino concluído sob A continua exibindo A. |

Não é necessário implementar a agenda inteira para testar a primeira jornada de criação e reabertura. O bloqueio efetivo é condição para liberar a edição em conjunto com o executor existente. O cenário de ativação exige a integração real com a agenda.

## Decisões propostas para esta página

Salvar explicitamente, permitir criar um plano sem ativá-lo e manter a página consultável durante um treino são escolhas desta proposta. Para a primeira entrega, recomenda-se permitir salvar planos ainda em montagem pelo nome e exigir um treino prescrito utilizável para ativação. Uma sessão composta apenas de preparação consultiva também pode ser utilizável. Validar nome, referências e consistência de todas as séries presentes antes de salvar; o formulário mantém localmente a linha ainda incompleta após erro.

## Sequência de treinos e programação opcional

O editor permite ordenar os treinos do plano, por exemplo A → B → C → A, e salvar sem escolher datas. A tela do plano mostra o próximo treino. Quem quiser sugestões na agenda pode configurar uma cadência, como dois dias de treino e um de descanso, a data inicial e os dias indisponíveis, como domingo. A agenda também admite horários fixos para quem usa uma rotina semanal.

Regra aprovada: a finalização do treino esperado avança a sequência uma vez. Abrir a prévia, deixar passar uma data ou descartar o treino mantém o próximo item. O calendário projeta as próximas sugestões supondo que a pessoa seguirá a cadência e recalcula a partir do que ela realizou. Depois de dois treinos em dias consecutivos, reservar um dia de descanso. Qualquer dia sem treino, inclusive um domingo indisponível, interrompe a contagem de dias consecutivos.

Exemplo com início na quinta: quinta A, sexta B, sábado descanso, domingo indisponível, segunda C, terça A. Se a pessoa faltar na sexta, sábado oferece B. Domingo encerra a sequência de dias consecutivos e segunda oferece C. Após B, concluir A no lugar de C oferece “Só desta vez” (C continua pendente e depois começa outra volta em A) ou “Alterar a sequência” (revisar a lista e salvar a ordem futura). O histórico registra A. Um descanso após A e os dias indisponíveis adiam a sugestão de B até a primeira data permitida.
