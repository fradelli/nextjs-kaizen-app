# Catálogo de equipamentos e exercícios

- **Tipo:** Plano.
- **Área:** Catálogo.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

> Reconciliação de 21/11/2026: Base de importação não equivale a aprovação editorial. Há divergência de versionamento com o plano de autoria a resolver explicitamente. [Escopo e evidências](../RECONCILIATION.md#catálogo).

> Estado reconciliado: migração e primeira carga possuem implementação local em **Uso da primeira seed**. **Estado e evidências** conserva checkpoint anterior; aprovação editorial, modalidades e integração ao editor continuam pendentes. Não recriar schema/importador pelo texto histórico.

## Uso da primeira seed

Na raiz do aplicativo, `pnpm catalog:check` valida os arquivos e imprime a identificação e as contagens do pacote. Para um banco inicializado com as migrações, defina `DIRECT_URL` explicitamente no ambiente do processo e execute `pnpm catalog:apply`. O comando importa apenas os dois catálogos. A rotina de planos antigos é independente.

A migração `20261108010000_exercise_catalog` cria cinco tabelas. Grupos principais ficam indexados; cada alternativa de equipamento tem número de configuração e linhas de requisitos obrigatórios/opcionais. Características, exigência de parceiro, medidas, carga e decisões editoriais permanecem no perfil JSON. A anatomia inclui a ficha de leitura e as análises com seus grupos de origem. O lote preserva as fontes e as convenções de registro. O estado de pesquisa e o estado editorial do perfil têm significados distintos; a carga não constitui aprovação para publicação.

O importador usa uma transação e um bloqueio de catálogo. Cada pacote recebe hash de conteúdo incluindo a versão da projeção. Uma versão idêntica reconhecida como atual retorna sem regravar. Mantenha correções editoriais no JSON versionado. A verificação em PostgreSQL descartável aplicou a cadeia de migrações e duas cargas consecutivas; as contagens e os resumos dos exercícios e requisitos coincidiram.

## Estado e evidências

Proposta técnica para aprovação. A preparação dos dados foi autorizada. Migração e carga no PostgreSQL dependem da revisão deste desenho. Entradas normativas: [arquitetura](../../architecture/TARGET-ARCHITECTURE.md), [equipamentos](../../../data/catalogs/equipamentos.json), [exercícios](../../../data/catalogs/exercicios.json) e [resultado da auditoria](../../../data/catalogs/revisao.json).

O pacote preserva 179 equipamentos, acessórios e apoios, 1.406 entradas de exercícios e 1.454 registros de origem. Existem 20 pares com nome normalizado igual. Só cinco possuem requisitos estruturalmente iguais. Há 20 IDs com requisitos divergentes entre os grupos. Esses números identificam candidatos à revisão, sem provar equivalência biomecânica. Faltam nomes ingleses em 1.212 entradas. Nos registros de origem, faltam modalidade de medição em 1.448 e modalidade de carga em 1.433.

A pesquisa fornecida pelo proprietário é aceita como origem própria. Referências externas permanecem quando conhecidas. A ausência de ID externo é permitida para conteúdo da pesquisa. O usuário do aplicativo seleciona tipos publicados. A manutenção editorial do pacote pode acrescentar equipamentos.

## Preparação dos dados

1. Preservar os arquivos atuais como material de origem. O pacote publicável será derivado com versão de formato e hash de conteúdo.
2. Criar um mapa explícito de equivalências entre IDs candidatos. Comparar movimento, posição corporal, equipamento, unilateralidade e requisitos antes de unir. Registrar os IDs antigos como aliases permanentes.
3. Unir grupos musculares e sinônimos das entradas equivalentes. Guardar fonte e grupo de cada afirmação. Resolver divergências antes de consolidar requisitos em uma única regra publicável.
4. Traduzir os nomes e revisar a terminologia. As quatro adaptações de peito já registradas usam como referência nomes ingleses públicos do Hevy. Outras variantes preservam os nomes recebidos até revisão.
5. Atribuir modalidade de medição e carga por exercício. Propostas automáticas precisam de evidência da configuração e revisão editorial. Não preencher a partir do grupo muscular.
6. Classificar entradas como equipamento, acessório ou apoio. Parede e ponto de ancoragem continuam representáveis como requisitos. Alta e baixa são capacidades da polia; polia dupla representa disponibilidade simultânea. Uma máquina abdutora/adutora aparece como duas seleções.
7. Preservar todas as entradas durante a preparação. Publicar cada entrada quando seus campos essenciais e requisitos estiverem consistentes. Produzir contagem e lista das pendências em cada versão.

## Contratos de medição propostos

Cada exercício declara medidas exigidas, unidades e interpretação de carga. Valores reais começam vazios. Repetições e contatos são inteiros positivos quando registrados. Duração e distância são positivas, com unidades canônicas segundo e metro. Configuração tempo/distância exige ambas. Por lado exige valores para os lados configurados; registrar apenas um lado é parcial.

Carga externa total exige carga informada e repetições. Peso corporal permite repetições sem carga adicional informada; zero representa explicitamente nenhuma carga externa. Assistência quantificada exige carga negativa e repetições. Assistência não quantificada aceita repetições e uma identificação do recurso, sem inferir quilogramas. Carga possui uma única coluna decimal anulável. Validar a matriz por modalidade antes de ligar o catálogo à execução. O snapshot futuro deve preservar a modalidade e unidades usadas naquela sessão.

## Modelagem proposta

Criar `prisma/models/catalog.prisma`, mantendo o schema raiz e a configuração atual. As chaves textuais atuais permanecem como identificadores estáveis; renomear o texto exibido conserva a chave.

| Entidade | Campos e invariantes principais |
|---|---|
| CatalogEquipment | ID textual estável, nome inglês e português, classe, estado editorial e revisão |
| CatalogEquipmentAlias | Alias único apontando para o ID canônico |
| CatalogExercise | ID textual estável, nome inglês e português, família, perfil de medição, modalidade de carga, estado e revisão |
| CatalogExerciseAlias | Alias único; nunca reutilizar uma chave para outro movimento |
| CatalogMuscle | Chave estável e nomes revisados |
| CatalogExerciseMuscle | Exercício, músculo e papel principal/secundário; vínculo único |
| CatalogEquipmentConfiguration | Configuração alternativa completa de um exercício, com ID e ordem |
| CatalogEquipmentRequirement | Configuração, equipamento e papel obrigatório/opcional; vínculo único |
| CatalogSourceReference | Origem e identificador externo ligados ao equipamento ou exercício; exatamente um destino; origem/tipo/ID externo únicos |
| CatalogImport | Hash do pacote único, versão de formato e momento da aplicação |

Preservar proveniência e afirmações originais no JSON revisado. Publicar no banco somente a interpretação consolidada. Não criar uma tabela para cada campo editorial. Requisitos desconhecidos bloqueiam publicação. Exercício revisado sem equipamento tem estado explícito e nenhuma configuração material. Não converter uma configuração ausente em ausência de equipamento.

Nomes ingleses podem ficar nulos enquanto rascunho. Publicação exige os dois nomes, medidas, interpretação de carga e requisitos revisados. Referências externas são opcionais para a pesquisa própria.

## Importação proposta

Criar rotina explícita de conferência e aplicação, independente do início do aplicativo. Validar esquema, IDs, aliases, referências, unicidade e requisitos antes de abrir transação. Conferência mostra inclusões, mudanças, retiradas e colisões sem gravar.

Aplicação adquire bloqueio transacional do importador de catálogo, reconhece o hash já aplicado e retorna o resultado anterior. Grava entidades por ID estável, com restrições únicas no banco, e registra o hash na mesma transação. Falha reverte tudo. Duas aplicações concorrentes do mesmo pacote produzem um resultado único. Retirada do arquivo não apaga automaticamente uma entidade; exigir estado editorial explícito.

O pacote revisado é a fonte editorial inicial. Correções aprovadas entram nele e conservam IDs. Se futuramente existir editor no banco, acrescentar controle de revisão para rejeitar sobrescrita de conteúdo alterado após o pacote. Não afirmar que um upsert sozinho protege correções.

## Arquivos e integração

| Caminho | Ação futura |
|---|---|
| `data/catalogs/` | Manter pesquisa, mapa de equivalências e pacote publicável versionado |
| `schemas/catalog.schema.json` | Criar contratos do pacote e validação das referências |
| `scripts/validate-data.mjs` | Integrar validação de catálogo ao gate existente |
| `prisma/models/catalog.prisma` | Criar as entidades aprovadas |
| `prisma/migrations/<timestamp>_catalog/` | Criar tabelas e restrições aditivas após aprovação |
| `src/features/catalog/domain/` | Criar validação de identidade, requisitos e perfis com consumidores concretos |
| `src/features/catalog/application/` | Criar conferência e aplicação por portas de repositório |
| `src/features/catalog/data/` | Criar adaptador Prisma, bloqueio e transação |
| `scripts/import-catalog.ts` | Criar entrada operacional com alvo de ambiente explícito |
| `package.json` | Acrescentar comandos de conferência e aplicação |
| `src/features/backup-restore-validation/` | Incluir catálogo e identidade nas verificações existentes |
| `tests/integration/` | Cobrir aplicação, concorrência, rollback e restauração |

Não há dependência nova demonstrada. Reutilizar PostgreSQL, Prisma e validadores existentes. O catálogo é global editorial; workspace continua necessário nos dados pessoais de treino. Os dados antigos de treino e dieta são de teste e serão descartados. Os planos antigos não serão reconstruídos ou migrados. O Kaizen não persistirá versões de planos. A execução finalizada guarda o próprio contexto. O destino de `data/` é conter somente catálogos; retirar os JSONs de planos de treino e dieta junto com seus consumidores, importadores e validações em uma etapa específica.

## Migração e segurança histórica

A primeira migração acrescenta tabelas. Não exige reset nem retirada das tabelas de alimentação, treino ou plataforma. Antes da aplicação, conferir o ambiente sem expor credenciais e produzir backup quando aplicável. Depois, verificar quantidades, IDs, FKs e capacidade de reaplicar o pacote.

Se a carga falhar, a transação mantém o catálogo anterior. Depois de uma carga bem-sucedida, correção de dados usa pacote revisado. Retirar tabelas só é opção enquanto ainda não houver consumidores e após autorização específica. Catálogo estável e snapshots de execução serão necessários ao refatorar planos; a presente entrega não faz essa integração.

## Etapas e aceite

1. Resolver os candidatos listados na auditoria, nomes ingleses e modalidades. Aceite: toda entrada tem destino canônico ou pendência explícita, com zero perda dos 1.454 registros de origem.
2. Preparar pacote publicável e validar contratos. Aceite: zero referência quebrada e nenhuma modalidade inferida apenas por nome de grupo.
3. Aprovar schema e migração. Aceite: IDs e referências do novo catálogo preservados, dependências dos antigos importadores identificadas, ambiente de aplicação identificado.
4. Implementar conferência e importador. Aceite: banco vazio, segunda aplicação, aplicações concorrentes, hash repetido, alias em colisão, desaparecimento da fonte e falha intermediária cobertos.
5. Validar backup e restauração. Aceite: IDs e vínculos idênticos após restaurar; mesmo pacote funciona sem consultar fontes externas.
6. Integrar catálogo ao editor de planos em tarefa posterior. Aceite: variantes independentes, um exercício por treino, seleção de configurações e contexto histórico protegido.

## Pendências delimitadas

Concluir revisão semântica e modalidades de todas as entradas. Distinguir associação genérica de requisito completo nos 20 IDs com afirmações divergentes. Definir quais apoios aparecem na seleção futura do local. Campos de contatos e lados precisam dos contratos concretos antes de uso na execução. Este plano não declara os 1.406 itens publicáveis nem usa a contagem como meta de qualidade.
