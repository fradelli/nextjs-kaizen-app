---
id: E08-T03
epic: E08
depends_on: [E08-T02, E05-T05]
---

# Preparar produção

## Objetivo

Preparar banco, variáveis, branch e configuração de produção sem liberar o MVP.

## Entradas

- `docs/plans/release/E08.md`
- `docs/decisions/PRIVACY-AND-OPERATIONS.md`
- `docs/operations/BACKUP-AND-RESTORE.md`
- `.github/workflows/`
- `prisma/migrations/`
- Evidência aprovada do preview e de E08-T02.

## Entregáveis

- Ambiente de produção configurado e checklist de release.

## Subtarefas

- [ ] Associar `master` à produção.
- [ ] Criar banco e segredos exclusivos de produção.
- [ ] Aplicar migrations e importação de forma controlada.
- [ ] Executar CI no SHA promovido e exigir evidência do preview.
- [ ] Usar Vercel CLI fixada e deploy prebuilt.
- [ ] Confirmar URL gerada, logs, backup externo e limites operacionais.

## Validações

- Validar configuração sem expor valores secretos.

## Critérios de aceite

- [ ] Produção está pronta para promoção reproduzível.

## Resultado

Ainda não concluída.
