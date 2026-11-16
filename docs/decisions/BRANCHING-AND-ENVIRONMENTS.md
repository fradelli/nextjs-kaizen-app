# Branches e ambientes

> Esclarecimento operacional aprovado em 12/11/2026: o prefixo genérico abaixo registra a decisão original. A governança implementada aceita somente `codex/<ID>-descricao-curta`; veja o [padrão de PR](../delivery/PULL-REQUEST-STANDARD.md). Direções e métodos de merge permanecem válidos.

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
