---
id: E08-T04
epic: E08
depends_on: [E08-T03]
---

# Validar operação e rollback

## Objetivo

Comprovar monitoramento mínimo, backup, restauração e retorno à versão anterior.

## Entradas

- `docs/plans/release/E08.md`
- `docs/decisions/PRIVACY-AND-OPERATIONS.md`
- `docs/operations/BACKUP-AND-RESTORE.md`
- Ambiente de produção preparado em E08-T03.

## Entregáveis

- Runbook curto e evidências dos testes operacionais.

## Subtarefas

- [ ] Definir sinais mínimos de saúde e falha.
- [ ] Testar backup externo e restauração em branch Neon isolada.
- [ ] Simular rollback da aplicação.
- [ ] Registrar responsáveis e sequência de recuperação.

## Validações

- Executar o runbook sem depender de conhecimento não documentado.

## Critérios de aceite

- [ ] Uma falha pode ser detectada e revertida com passos claros.

## Resultado

Ainda não concluída.
