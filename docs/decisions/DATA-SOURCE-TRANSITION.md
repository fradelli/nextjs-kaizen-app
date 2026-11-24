# Transição da fonte de verdade

- **Tipo:** Decisão.
- **Área:** Dados.
- **Tarefas relacionadas:** [E03-T02](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E03-product-and-architecture/T02-define-source-of-truth-transition.md), [E03-T03](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E03-product-and-architecture/T03-define-privacy-and-operations.md), [E05-T05](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E05-database-and-import/T05-validate-backup-and-restore.md).

## Status

- Data: 2026-09-02
- Decisão: aprovada
- Tarefa: `E03-T02`
- Escopo: planos versionados, importação e registros operacionais do P0

## Decisão

Durante o MVP, os arquivos JSON versionados continuam sendo a única fonte editável das **definições de treino e alimentação**. O banco recebe projeções imutáveis dessas versões e se torna a única fonte editável dos **dados operacionais**: atribuições diárias, escolhas, cumprimento, séries, cargas, repetições e comentários.

Não existe sincronização bidirecional. A aplicação não altera arquivos JSON, e edições manuais no banco não alteram definições importadas.

## Ownership por classe de dado

| Classe                              | Fonte editável no MVP          | Cópias ou projeções                | Regra                                                                    |
| ----------------------------------- | ------------------------------ | ---------------------------------- | ------------------------------------------------------------------------ |
| Biblioteca de exercícios            | Git/JSON                       | registros importados imutáveis     | mudança nasce em nova versão validada no repositório                     |
| Planos de treino                    | Git/JSON                       | versões importadas no banco        | `plan_id` + `version` não podem mudar após importação                    |
| Plano alimentar                     | Git/JSON                       | versão importada no banco          | conteúdo aprovado permanece versionado e imutável                        |
| Ponteiros ativos                    | Git/JSON                       | ativação correspondente no banco   | importador aplica o ponteiro somente após importar a versão referenciada |
| Regras e guias                      | Git/Markdown/JSON              | texto exibido ou projeção derivada | banco não vira editor dessas regras                                      |
| Atribuição de treino ou tipo de dia | banco                          | nenhuma cópia versionada no Git    | pertence ao workspace e à data civil                                     |
| Execução de treino                  | banco                          | backups e exportações              | séries, medidas, status e comentários são operacionais                   |
| Cumprimento alimentar               | banco                          | backups e exportações              | opção, estado, alternativa e comentário são operacionais                 |
| Identidade e membership futuros     | banco/provedor de autenticação | backups                            | não entram no Git                                                        |
| Segredos e configuração de ambiente | plataforma do ambiente         | configuração local ignorada        | nunca entram no Git nem em exportação de domínio                         |
| Proveniência de migração            | Git/manifesto                  | metadados de importação no banco   | o manifesto público continua sendo a evidência histórica                 |

Backups e exportações são cópias, não fontes editáveis concorrentes.

## Fases

### Fase 0 — fundação documental concluída

- JSON e Markdown são as fontes canônicas disponíveis.
- Não há banco operacional nem registro de execução.
- E01 e E02 estão marcados por tags imutáveis.

### Fase 1 — aplicação antes da persistência completa

- O servidor pode ler os arquivos versionados para validar o shell e projeções.
- Escritas de execução permanecem desabilitadas até o banco e as migrations estarem prontos.
- Nenhum armazenamento temporário no navegador é apresentado como persistência concluída.

### Fase 2 — MVP persistido

- O importador valida e materializa no banco as versões aprovadas.
- Leituras do produto usam o banco para combinar plano importado e registros operacionais.
- JSON continua sendo a fonte editável das definições.
- Banco é a fonte editável exclusiva das execuções.
- Cada execução referencia a versão importada exibida quando o registro foi criado.

### Fase 3 — planos criados por usuários, futura

Quando cadastro e edição de planos forem aprovados, uma decisão nova deve definir o corte. A partir desse corte, planos criados pela interface podem ter o banco como fonte canônica; os planos históricos do repositório permanecem seeds imutáveis.

Essa fase exige:

1. versão do modelo compatível com ownership por workspace;
2. exportação antes do corte;
3. importação final validada;
4. desativação do caminho de edição antigo;
5. uma data e versão de cutover registradas;
6. proibição explícita de dual-write.

O MVP não antecipa essa mudança.

## Contrato da importação

### Unidade de importação

Uma execução do importador cria um lote com:

- identificador próprio;
- commit da aplicação;
- tipo da fonte;
- caminho relativo;
- SHA-256 dos bytes versionados;
- versão do schema de origem;
- início, término e resultado;
- erro sanitizado, quando houver.

O clone local e o worktree não fazem parte da identidade. Em CI e deploy, a origem é o commit que está sendo construído.

### Ordem obrigatória

1. validar parse de todos os JSONs necessários;
2. validar cada documento contra seu schema disponível;
3. validar IDs únicos e referências cruzadas;
4. calcular o SHA-256 dos bytes do commit;
5. abrir transação;
6. registrar ou localizar o lote pelo hash da fonte;
7. inserir biblioteca e versões ainda ausentes;
8. verificar que versões existentes possuem o mesmo hash;
9. aplicar os ponteiros ativos somente após todas as referências existirem;
10. concluir o lote e a transação;
11. falhar o deploy se qualquer etapa falhar.

Um lote parcial nunca fica visível como ativo.

## Idempotência

- O mesmo conjunto de caminho e SHA-256 importado novamente produz `no-op` verificável.
- Uma versão já existente com o mesmo hash é reutilizada.
- O mesmo `plan_id` e `version` com hash diferente é conflito e interrompe a importação.
- Correção material cria nova versão no JSON; não sobrescreve a anterior no banco.
- Ativar novamente a mesma versão não cria outra versão do plano.
- Atribuições e execuções nunca são recriadas por reimportação.

Chaves técnicas podem variar, mas essas identidades naturais e restrições precisam ser preservadas no schema relacional.

## Ponteiros e leitura

- O importador resolve `data/active.json` e `data/nutrition/active.json` dentro do mesmo commit das versões.
- `active_plan_id` precisa coincidir com o conteúdo do arquivo apontado.
- O banco registra uma ativação separada da versão imutável.
- Trocar o ponteiro cria uma nova ativação; não altera registros históricos.
- Se o ponteiro referenciar uma versão ausente ou inválida, a importação falha e a ativação anterior permanece.
- A aplicação não faz fallback silencioso para outro plano.

## Escritas operacionais

- Todas pertencem a `workspace_id` e data civil em `America/Sao_Paulo`.
- O servidor resolve o workspace fixo; valores enviados pelo cliente não definem ownership.
- Unicidade impede duplicar o mesmo registro lógico do dia.
- Atualizações usam revisão ou versão para detectar concorrência.
- Texto é armazenado como texto simples e validado antes de persistir.
- Um registro histórico mantém referência à versão executada, mesmo após nova ativação.
- Importação nunca atualiza ou exclui dados operacionais.

## Conflitos

| Situação                                     | Resultado                                                |
| -------------------------------------------- | -------------------------------------------------------- |
| mesmo arquivo e mesmo hash                   | `no-op`                                                  |
| mesmo `plan_id` + `version` e hash diferente | falha bloqueante; criar nova versão                      |
| ponteiro para versão inexistente             | falha bloqueante; ativação anterior preservada           |
| referência de exercício ou opção inexistente | falha bloqueante                                         |
| importação concorrente do mesmo lote         | uma vence pela restrição única; a outra confirma `no-op` |
| edição operacional baseada em revisão antiga | conflito; recarregar antes de reenviar                   |
| banco contém plano sem proveniência          | dado inválido; não pode ser ativado                      |
| JSON e projeção ativa divergem               | deploy falha; banco não é corrigido manualmente          |

## Exportação e backup

### Definições

O Git já preserva as definições públicas e suas versões. Uma exportação do banco pode incluir IDs e hashes de proveniência, mas não se torna um caminho alternativo de edição ou reimportação automática.

### Dados operacionais

- São protegidos pelos backups do provedor do banco.
- Produção deve possuir exportação periódica recuperável fora do repositório público.
- Exportações contêm dados pessoais e nunca podem ser commitadas.
- O formato de exportação inclui schema/versionamento, workspace, data, referências de plano e timestamps.
- Um teste de restauração precisa demonstrar que registros continuam ligados às versões importadas.

Retenção, frequência e procedimento concreto serão fechados em E03-T03 e implementados em E05-T05/E08.

## Rollback

### Falha de importação

A transação é revertida e a ativação anterior permanece. Não se edita o banco para forçar sucesso.

### Plano novo com problema

O ponteiro versionado volta a uma versão válida por nova mudança em Git. O importador cria nova ativação para a versão anterior; históricos permanecem intactos.

### Migration de banco

Produção usa migrations progressivas e correções para frente. Restauração de backup é reservada a desastre ou corrupção, após interromper escritas e registrar o ponto de recuperação.

### Código

Rollback de aplicação precisa usar uma versão compatível com o schema já aplicado. Migrations destrutivas não podem acompanhar a mesma promoção que remove o leitor antigo.

## Regras que evitam duas fontes

- A UI do MVP não edita biblioteca, planos, regras ou ponteiros.
- Administradores não corrigem plano importado diretamente no banco.
- A aplicação não gera commit nem altera arquivo de `data/`.
- O importador é unidirecional: Git para banco.
- Dados operacionais não são exportados para `data/`.
- Seeds de teste não são backups nem dados de produção.
- Toda mudança de ownership exige decisão de cutover versionada antes do código.

## Consequências

### Benefícios

- definições continuam auditáveis e revisáveis por PR;
- registros pessoais ficam fora do repositório público;
- o banco pode ser reconstruído para definições sem apagar execuções;
- histórico preserva exatamente a versão apresentada;
- evolução futura para contas não exige misturar ownership desde o início.

### Custos aceitos

- o importador precisa validar referências e idempotência além do JSON Schema;
- ativação requer uma etapa transacional explícita;
- edição de planos pela interface fica adiada;
- backups operacionais precisam ser testados separadamente do Git.

## Validação da decisão

Para cada escrita do P0 existe uma resposta única:

- definição de plano: Git;
- projeção importada: imutável;
- atribuição e execução: banco;
- segredo: plataforma do ambiente;
- backup/exportação: cópia não editável.

Leitura, escrita, reimportação, conflito e rollback possuem ownership inequívoco sem dual-write.
