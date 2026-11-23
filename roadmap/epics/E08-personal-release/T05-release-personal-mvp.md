---
id: E08-T05
epic: E08
depends_on: [E08-T04]
---

# Publicar MVP pessoal

## Objetivo

Promover a versão validada para produção e encerrar o MVP pessoal de Dieta e Treino.

## Entradas

- `docs/plans/release/E08.md`
- `docs/decisions/PUBLIC-SINGLE-WORKSPACE-MODE.md`
- `.github/PULL_REQUEST_TEMPLATE/release-promotion.md`
- Runbook e evidências aprovados em E08-T04.

## Entregáveis

- Produção disponível na URL gerada, com exposição pública aceita e release documentada.

## Subtarefas

- [ ] Promover mudanças de `staging` para `master` por PR.
- [ ] Executar migrations e importação aprovadas.
- [ ] Rodar smoke público de leitura e mutação no workspace fixo.
- [ ] Registrar versão, data, limitações e próximo marco.

## Validações

- Confirmar conteúdo e operações públicas no workspace fixo em treino e alimentação.

## Critérios de aceite

- [ ] MVP pessoal funciona conforme o risco público documentado e possui caminho de rollback.

## Resultado

Ainda não concluída.
