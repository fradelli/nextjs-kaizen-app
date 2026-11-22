# Backup e restauração local

- **Tipo:** Operação.
- **Área:** Banco de dados.
- **Tarefas relacionadas:** [E08-T03](../../roadmap/epics/E08-personal-release/T03-prepare-production.md), [E08-T04](../../roadmap/epics/E08-personal-release/T04-validate-operations-and-rollback.md).

## Finalidade

Este runbook comprova que o banco do Kaizen pode ser recuperado entre duas
instâncias PostgreSQL locais, independentes e descartáveis. Ele valida a
ferramenta e o procedimento; não configura backup de produção.

O fluxo usa somente os serviços `database-backup-source` e
`database-backup-restore`, ambos em `tmpfs`. O banco persistente `kaizen_local`,
o serviço `database-test`, seus volumes e containers de outros projetos não são
alvos do comando.

## Limites de segurança

- Os bancos aceitos são fixos: `kaizen_backup_source` e
  `kaizen_backup_restore`.
- As portas padrão 5434 e 5435 são distintas das portas 5432 e 5433 já usadas.
- Os binds são restritos a `127.0.0.1`.
- A senha existe apenas no ambiente e não aparece em argumentos, relatórios ou
  mensagens de erro.
- O restore exige um container novo e não usa `--clean` para apagar um destino.
- O dump temporário não é versionado nem publicado como artefato.
- A limpeza remove somente os dois serviços descartáveis e o diretório temporário
  criado pela execução.

## Pré-requisitos

- Docker Desktop ou Docker Engine com Compose disponível.
- Node.js e pnpm nas versões declaradas pelo projeto.
- Dependências instaladas.
- Uma senha local sintética de ao menos 12 caracteres em
  `BACKUP_DATABASE_PASSWORD`.

As portas podem ser alteradas com `BACKUP_SOURCE_DATABASE_PORT` e
`BACKUP_RESTORE_DATABASE_PORT`. Elas precisam ser distintas, estar entre 1024 e
65535 e não podem usar 5432 ou 5433. Não é necessário configurar URLs: o comando
constrói internamente destinos loopback com nomes fixos.

## Execução

Configure as três variáveis no `.env` local e execute:

```sh
pnpm db:recovery:check
```

O comando executa, nesta ordem:

1. remove resíduos apenas dos dois serviços descartáveis;
2. inicia as duas instâncias e aguarda os healthchecks;
3. aplica migrations somente na origem;
4. importa as definições canônicas do commit `HEAD`;
5. cria um canário operacional sintético com workspace, atribuições e execuções;
6. captura contagens, planos ativos e identidades internas da origem;
7. executa `pg_dump` em formato custom, sem owner ou privilégios;
8. restaura em transação única com `pg_restore --exit-on-error`;
9. confirma migrations, integridade canônica, contagens, vínculos e identidades;
10. remove dump, diretório temporário e containers em `finally`.

## Resultado esperado

Sucesso retorna código zero e um JSON sanitizado com:

- commit da aplicação;
- versão do PostgreSQL;
- formato, tamanho e SHA-256 do dump;
- duração do backup e do restore;
- contagens globais e do workspace sintético;
- confirmação de migrations, integridade e preservação de identidades.

Falhas retornam código diferente de zero e apenas um destes códigos:

- `CONFIGURATION_INVALID`;
- `DOCKER_UNAVAILABLE`;
- `MIGRATION_FAILED`;
- `SOURCE_PREPARATION_FAILED`;
- `BACKUP_FAILED`;
- `RESTORE_FAILED`;
- `VALIDATION_FAILED`;
- `CLEANUP_FAILED`.

Não copiar o dump ou a saída bruta das ferramentas para issues, PRs ou logs
públicos. O relatório sanitizado e o check da CI são a evidência suficiente.

## Recuperação de falha

O comando não substitui nenhum banco. Se falhar, mantenha o código de falha,
confirme que Docker e portas estão disponíveis e execute novamente. Resíduos dos
serviços descartáveis podem ser removidos sem afetar outros serviços:

```sh
docker compose --profile backup-test rm --stop --force database-backup-source database-backup-restore
```

Não usar `docker compose down`, não remover `database_data` e não apontar o fluxo
para um banco operacional.

## Fora de escopo

Backup diário, criptografia e armazenamento externo, retenção, Neon, dados reais,
RPO/RTO gerenciado e restauração de produção pertencem à E08-T03/E08-T04. Antes
de uma restauração real, mutações devem ser interrompidas e o ponto recuperado
deve ser validado isoladamente antes de qualquer troca de tráfego.
