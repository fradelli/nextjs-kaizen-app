# Branches e ambientes

- **Tipo:** Decisão.
- **Área:** Governança.
- **Tarefas relacionadas:** [E00-T01](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E00-repository-governance/T01-initialize-repository-and-branches.md).

> Esclarecimento operacional aprovado em 12/11/2026: o prefixo genérico abaixo registra a decisão original. A governança implementada aceita somente `codex/<ID>-descricao-curta`; veja o [padrão de PR](../delivery/PULL-REQUEST-STANDARD.md). Direções e métodos de merge permanecem válidos.

> Atualização aprovada em 23/11/2026 (E00-T12): com a adoção exclusiva do Claude Code, a governança passa a aceitar somente `claude/<ID>-descricao-curta`. Branches `codex/` já integradas permanecem como histórico. Direções e métodos de merge seguem inalterados.

> Update approved on 2026-11-24 (KZ-E00-T17): task IDs come from the playbook, so branches follow `claude/KZ-<ID>-short-description` and titles `[KZ-<ID>] type(scope): summary`. Directions and merge methods are unchanged.

## Status

- Data: 2026-08-30
- Decisão: aprovada
- Escopo: fluxo Git e associação futura com ambientes

## Decisão

| Branch | Papel | Ambiente esperado |
| --- | --- | --- |
| `developer` | Integração contínua das tarefas | Execução local e validação por PR |
| `staging` | Candidata estável para homologação | Preview estável na Vercel |
| `master` | Código aprovado para publicação | Produção na Vercel |

Toda mudança parte de `developer` em uma branch curta e retorna por pull request. As promoções seguintes também ocorrem por pull request: `developer` para `staging` e `staging` para `master`.

Branches de tarefa seguem `<tipo>/E00-T01-descricao-curta`. PRs de tarefa usam squash em `developer`; promoções `developer -> staging` e `staging -> master` usam merge commit para preservar o SHA aprovado.

## Limite atual

As branches estão criadas, mas não existe aplicação nem projeto Vercel configurado. Portanto, local, preview e produção são papéis planejados, não ambientes operacionais. A configuração e a verificação reais pertencem ao épico E08.

## Motivo

O fluxo separa integração, homologação e produção sem criar repositórios ou backends adicionais. Ele também permite validar cada promoção e manter `master` estável.

## Rollback

Uma promoção com problema deve usar o último deployment saudável ou um novo commit/PR de correção. Não reescrever histórico compartilhado nem usar force push como procedimento normal. Rollback da aplicação não reverte migrations: mudanças de banco devem ser compatíveis com a versão anterior ou corrigidas por migration adiante.
