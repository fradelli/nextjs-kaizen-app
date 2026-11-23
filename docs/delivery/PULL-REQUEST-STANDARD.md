# Padrão de pull request

- **Tipo:** Guia.
- **Área:** Governança.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

## Objetivo

Manter PRs curtas, rastreáveis pelo roadmap e verificáveis sem depender de Jira. O formato deriva do Sandicts, substituindo `KAN-123` pelo ID local da tarefa e removendo campos corporativos que não existem no Kaizen.

## Título

Formato obrigatório:

```text
[E00-T01] tipo(escopo): resumo curto
```

Exemplos:

```text
[E00-T06] docs(delivery): definir padrão de PR e CI/CD
[E04-T01] feat(app): criar aplicação Next.js
[E08-T05] chore(release): promover staging para master
```

Regras:

- o ID deve existir em `roadmap/README.md` e ser a tarefa principal;
- tipos permitidos: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `chore`, `build`, `perf` e `style`;
- escopo usa letras minúsculas, números e hífen;
- não existe prefixo `NO-JIRA`: toda entrega deve possuir uma tarefa local;
- quando uma PR abranger itens relacionados, somente o principal vai no título; os demais ficam em `Observações`.

## Branch

Formato obrigatório para branches temporárias:

```text
codex/E00-T01-descricao-curta
```

O validador atual aceita somente `codex` em branches de tarefa. O slug usa kebab-case minúsculo. Ampliar prefixos ou tipos exige mudança própria no contrato.

## Descrição

Use `.github/pull_request_template.md` e preserve esta ordem:

1. `Resumo`
2. `Problema`
3. `Causa raiz`
4. `Alterações`
5. `Arquivos adicionados ou atualizados`
6. `Impacto`
7. `Validação`
8. `Observações`

Preencha todas as seções com evidências da PR. Não deixe placeholders, não marque checks não executados e registre explicitamente qualquer validação não aplicável.

## Direção e merge

| Destino | Origem aceita | Método |
| --- | --- | --- |
| `developer` | branch temporária válida | squash |
| `staging` | `developer` | merge commit |
| `master` | `staging` | merge commit |

Branches protegidas não retornam para `developer`. Promoções usam o template especializado e registram SHA de origem, ambiente, evidência e rollback.

Contrato executável: `scripts/validate-governance.mjs`. Este guia reflete o comportamento implementado; `hotfix` e `revert` não são tipos aceitos atualmente.

## Validação proporcional

- Documentação: links, IDs, dependências, dados indevidos e `git diff --check`.
- Aplicação: lint, typecheck, testes, build e audit de dependências.
- Dados ou banco: validações da aplicação mais schema, IDs, importação idempotente e migrations.
- Publicação: CI completo do SHA promovido mais smoke test do ambiente.

O corpo da PR deve diferenciar claramente o que mudou, o que não mudou e os checks que ainda não existem na fase atual.
