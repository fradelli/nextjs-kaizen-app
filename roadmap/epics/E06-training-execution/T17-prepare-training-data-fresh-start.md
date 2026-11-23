---
id: E06-T17
epic: E06
depends_on: [E06-T11]
---

# Preparar reinício controlado dos dados de treino

## Objetivo

Planejar e executar, somente após autorização específica, um início operacional
limpo após preparar a nova programação, sem perder dados fora do escopo aprovado.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `prisma/models/training.prisma`
- `prisma/models/nutrition.prisma`
- `roadmap/epics/E05-database-and-import/T05-validate-backup-and-restore.md`
- `roadmap/epics/E06-training-execution/T11-review-daily-plan-lifecycle.md`

## Entregáveis

- Inventário do banco e definição explícita de ambiente, tabelas e registros alvo.
- Escolha documentada entre reiniciar somente dados operacionais de treino ou
  também definições/importações e alimentação; nada será presumido.
- Backup verificável, plano de rollback e confirmação do usuário antes da exclusão.
- Execução transacional ou procedimento recuperável e verificação do estado vazio.
  A importação/ativação e a leitura da nova semana pertencem à E06-T16.

## Subtarefas

Não registrado na versão original desta tarefa.

## Validações

Não registrado na versão original desta tarefa.

## Fora de escopo

- Excluir qualquer dado antes de definir escopo, obter backup e aprovação.
- Apagar ambientes ou volumes inteiros por conveniência.

## Decisões antes da implementação

- Confirmar com o usuário o banco/ambiente exato e o alcance do reinício.
- Confirmar política para histórico antigo e dados de alimentação.

## Critérios de aceite

- [x] Alvos de exclusão, backup e recuperação foram comprovados e aprovados.
- [x] Somente dados explicitamente autorizados foram removidos.
- [x] O ambiente aprovado fica pronto para receber a nova programação, sem
      resíduos operacionais fora do escopo decidido.

## Resultado

Autorizada pelo usuário a limpeza de registros operacionais e definições antigas de treino exclusivamente no PostgreSQL local, preservando alimentação, workspace, migrations e histórico no Git. Backup completo atualizado em 26/09, copiado fora do repositório e restaurado com sucesso em banco temporário. SHA-256: `50282d22712ce960ca97219565102c588c16ac48a45f9084d8f760055bb660db`. Banco temporário removido após verificação.

Limpeza concluída em transação, com bloqueio das tabelas-alvo e chaves estrangeiras ativas. Suspensos somente os triggers de proteção de exclusão nas tabelas-alvo, reativados antes do commit. Removidos registros operacionais, ativações e definições/importações de treino; nenhuma tabela de alimentação foi excluída. Conferência antes da importação: zero atividades e versões de treino, uma versão alimentar preservada. A E06-T16 importou apenas o treino ativo.

Rollback: interromper os escritores locais, restaurar o backup completo validado em banco local separado, conferir os dados e só então trocar o banco utilizado. Restaurar depois de novos registros substituiria o estado posterior ao backup; não fazer rollback automático nem apagar o backup.
