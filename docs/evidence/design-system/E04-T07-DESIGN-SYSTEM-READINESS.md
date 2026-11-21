# E04-T07 — Evidência de prontidão do Design System

- **Tipo:** Evidência.
- **Área:** Design system.
- **Tarefas relacionadas:** [E04-T08](../../../roadmap/epics/E04-nextjs-foundation/T08-integrate-versioned-design-system.md), [E04-T07](../../../roadmap/epics/E04-nextjs-foundation/T07-validate-design-system-readiness.md)

## Estado da avaliação

- **Data:** 2026-09-10
- **Base do Kaizen:** `b0d5f6c0f99f9b77547127a12563d950947fb6fa`
- **Contrato avaliado:** `@fradelli/ui@0.1.0`
- **Commit do contrato:** `3e0c23f591ff458ab9e3e74dc44bb0cdba068a03`
- **Decisão final:** **NO-GO**
- **Motivo bloqueante:** a autenticação local para leitura do GitHub Packages não está configurada ou disponível para as credenciais usadas na avaliação.

Esta avaliação não instalou o package e não alterou dependências, lockfile, CSS, layout, componentes ou workflow.

## Reavaliação operacional

- **Data:** 2026-09-11
- **Escopo:** resolver exclusivamente o gap bloqueante da avaliação inicial.
- **Evidência sanitizada:** a consulta de metadados de `@fradelli/ui@0.1.0` no GitHub Packages terminou com sucesso usando credencial mantida no perfil do usuário.
- **Contrato reconfirmado:** Node `>=24.20.0 <25`, React e React DOM `>=19.2.7 <20` e Tailwind CSS `>=4.3.0 <5`.
- **Segurança:** nenhum token, valor de `_authToken`, URL autenticada ou credencial foi registrado no repositório ou nesta evidência.
- **Decisão operacional:** **GO** para iniciar E04-T08 na versão exata `0.1.0`.

O NO-GO abaixo permanece como registro da avaliação original. Esta reavaliação não altera o contrato analisado; apenas comprova a autenticação de leitura que faltava.

## Escopo e fontes

Foram avaliados o manifesto e o lockfile do Kaizen, o workflow de CI, a fundação visual transitória, o contrato publicado em commit imutável e o acesso de leitura ao registry.

Fontes principais:

- [`package.json`](../../../package.json)
- [`pnpm-lock.yaml`](../../../pnpm-lock.yaml)
- [workflow de CI](../../../.github/workflows/ci.yml)
- [`globals.css`](../../../src/app/globals.css)
- [`layout.tsx`](../../../src/app/layout.tsx)
- [decisão de adoção](../../decisions/SHARED-DESIGN-SYSTEM-ADOPTION.md)
- [manifesto de `@fradelli/ui@0.1.0`](https://github.com/fradelli/design-system/blob/3e0c23f591ff458ab9e3e74dc44bb0cdba068a03/package.json)

## Matriz de runtime

| Item | Requisito | Observado | Evidência | Resultado |
| --- | --- | --- | --- | --- |
| Node.js | `>=24.20.0 <25` | `24.20.0` | `node --version` e `package.json` | PASS |
| pnpm | package manager do consumidor | `11.25.0` | `pnpm --version` e `packageManager` | PASS |
| Next.js | versão exata do Kaizen | `16.3.4` | `pnpm list next --depth=0` | PASS |
| React | `>=19.2.7 <20` | `19.2.8` | `pnpm list react --depth=0` | PASS |
| React DOM | `>=19.2.7 <20` | `19.2.8` | `pnpm list react-dom --depth=0` | PASS |

O runtime e os peers obrigatórios são compatíveis. Tailwind CSS é peer opcional do package e permanece ausente; sua versão exata pertence à E04-T08.

## Contrato publicado

O manifesto foi consultado diretamente no commit imutável, sem resolver ou baixar o package.

| Item | Contrato observado | Resultado |
| --- | --- | --- |
| Nome e versão | `@fradelli/ui@0.1.0` | PASS |
| Registry | `https://npm.pkg.github.com`, acesso `restricted` | PASS |
| Arquivos publicados | `dist` e `CHANGELOG.md` | PASS |
| CSS público | `@fradelli/ui/styles.css` → `./dist/styles.css` | PASS |
| Side effect declarado | `./dist/styles.css` | PASS |
| Engine Node | `>=24.20.0 <25` | PASS |
| Peers React | React e React DOM `>=19.2.7 <20` | PASS |
| Peer opcional | Tailwind CSS `>=4.3.0 <5` | PASS |

Exports públicos confirmados:

- raiz do package;
- `alert`, `badge`, `button`, `card`, `field`, `input`, `label`, `separator`, `sheet` e `skeleton`;
- helper `cn`;
- `styles.css` e `package.json`.

Não foram observados exports de shell, página, rota ou domínio do Kaizen.

## Gates locais

Execução na base avaliada:

| Gate | Resultado | Evidência resumida |
| --- | --- | --- |
| Instalação congelada | PASS | `pnpm install --frozen-lockfile`, sem alteração do lockfile |
| Formato | PASS | arquivos cobertos pelo script compatíveis com Prettier |
| Lint | PASS | zero warnings e zero erros |
| Typecheck | PASS | TypeScript sem erros |
| Testes da aplicação | PASS | 3 arquivos e 9 testes |
| Cobertura | PASS | 100% statements, lines e functions; 87,5% branches |
| Testes dos validadores | PASS | 15 testes em 2 suítes |
| Integridade dos dados | PASS | schemas, IDs, ponteiros e referências válidos |
| Build | PASS | build de produção do Next.js concluído |
| Auditoria | PASS | nenhuma vulnerabilidade conhecida no limiar `moderate` |

O comando agregado `pnpm run ci` terminou com sucesso.

### Observação sobre fim de linha no Windows

O checkout inicialmente materializou oito arquivos da E04-T05 com CRLF por causa da configuração global `core.autocrlf=true`, enquanto o repositório armazena LF. A configuração local foi ajustada para `core.autocrlf=false` e o worktree foi normalizado sem gerar diff versionado. Depois disso, o mesmo `format:check` executado no CI passou localmente.

Essa limitação não altera o contrato do Design System, mas uma política versionada de fim de linha pode ser avaliada em tarefa própria para tornar novos clones Windows independentes da configuração global do Git.

## CI e proteção de branches

A PR [#27](https://github.com/fradelli/kaizen-app/pull/27), aplicada no mesmo commit-base desta avaliação, concluiu com sucesso os jobs `Governance`, `Quality`, `Test`, `Data integrity`, `Build` e `Dependency audit`.

A primeira revisão da PR [#29](https://github.com/fradelli/kaizen-app/pull/29), que publica esta evidência, também concluiu os seis jobs com sucesso.

Os seguintes rulesets estão ativos e sem bypass:

| Ruleset | Branches | Pull request | Checks | Merge |
| --- | --- | --- | --- | --- |
| `developer-pr-gates` (`22853305`) | `developer` | obrigatória | seis gates obrigatórios, branch atualizada | squash |
| `promotion-pr-gates` (`22853306`) | `staging`, `master` | obrigatória | seis gates obrigatórios | merge commit |

Ambos bloqueiam exclusão e atualização non-fast-forward. O rebase merge foi desabilitado no repositório.

O workflow mantém `contents: read`, instalação congelada e nenhuma credencial. A permissão `packages: read` e a autenticação efêmera só devem ser adicionadas em E04-T08, quando existir o consumidor real.

## Registry e autenticação

### Testes executados

| Teste | Resultado sanitizado | Interpretação |
| --- | --- | --- |
| Consulta npm de `@fradelli/ui@0.1.0` | `401`, sem header de autorização | autenticação local ausente para o registry |
| Consulta de versões pela API do GitHub | `403`, token sem `read:packages` | a credencial atual não comprova leitura do package |

Nenhum token foi solicitado, exibido ou persistido.

### Estratégia local aprovada

- manter a credencial exclusivamente no perfil do usuário;
- usar PAT classic com somente `read:packages` e acesso de leitura compatível;
- manter no projeto, quando E04-T08 iniciar, apenas o mapeamento público do scope `@fradelli` para `https://npm.pkg.github.com`;
- validar acesso com consulta de metadados antes de qualquer instalação;
- nunca registrar `_authToken`, `NODE_AUTH_TOKEN`, PAT ou URL autenticada no Git ou no relatório.

### Estratégia futura do CI

- conceder `packages: read` somente aos jobs que instalarem dependências;
- autenticar com o `GITHUB_TOKEN` efêmero do workflow;
- fornecer `NODE_AUTH_TOKEN` somente ao passo de instalação;
- manter o acesso Read do repositório consumidor configurado no package;
- falhar a instalação se o acesso não estiver disponível, sem fallback por cópia, tarball ou dependência `file:`.

## Ausência de integração antecipada

- `@fradelli/ui` não aparece no manifesto nem no lockfile;
- nenhum `.tgz` está versionado;
- não existe dependência `file:` para o Design System;
- `globals.css` continua com a fundação clara e Arial transitórias;
- `layout.tsx` não carrega Inter nem CSS do package;
- o workflow não possui credencial ou permissão de packages.

## Gaps

### Bloqueantes para GO

1. Configurar autenticação local fora do repositório e repetir a consulta de metadados com sucesso.

### Não bloqueantes e fora do escopo desta tarefa

- definir versões exatas de Tailwind CSS, `@tailwindcss/postcss` e PostCSS em E04-T08;
- confirmar o caminho relativo final de `@source` a partir de `globals.css` em E04-T08;
- avaliar uma política versionada de LF para clones Windows em tarefa própria.

## Decisão

**NO-GO.** Runtime, peers, contrato publicado, gates locais, CI remoto e proteções de branch estão compatíveis. A integração permanece bloqueada porque nenhuma credencial disponível comprovou leitura de `@fradelli/ui@0.1.0` no GitHub Packages.

Uma nova avaliação pode emitir GO sem mudar a aplicação quando o gap bloqueante for comprovado. Até lá, E04-T08 não deve instalar o package.

## Rollback

Reverter somente este relatório e as atualizações de status relacionadas. Nenhuma dependência ou mudança de runtime foi introduzida. Uma versão futura do package exige nova evidência vinculada ao novo número e não deve reescrever esta avaliação de `0.1.0`.
