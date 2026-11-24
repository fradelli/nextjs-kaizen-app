# Adoção do Design System compartilhado

- **Tipo:** Decisão.
- **Área:** Design system.
- **Tarefas relacionadas:** [E04-T06](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E04-nextjs-foundation/T06-adopt-shared-design-system-decision.md), [E03-T04](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E03-product-and-architecture/T04-define-target-architecture.md), [E04-T01](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E04-nextjs-foundation/T01-scaffold-nextjs.md), [E04-T07](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E04-nextjs-foundation/T07-validate-design-system-readiness.md), [E04-T08](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E04-nextjs-foundation/T08-integrate-versioned-design-system.md), [E04-T04](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E04-nextjs-foundation/T04-create-accessible-shell.md), [E03-T05](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E03-product-and-architecture/T05-approve-implementation-guide.md), [E04-T02](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E04-nextjs-foundation/T02-configure-static-quality.md), [E04-T05](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E04-nextjs-foundation/T05-configure-minimal-ci.md).

> Evolução visual de 12/11/2026: o [guia aprovado no Kaizen](../product/telas/guia-de-estilo.md) substitui a aparência inicial por Mira/Lucide/IBM Plex Sans/Figtree. Ownership, imports públicos e distribuição por release permanecem. O contrato `0.1.0` abaixo é histórico. Tarball local é prévia da migração, não release para entrega. A decisão normativa externa não foi reconfirmada nesta revisão.

## Status

- **Estado:** aceita
- **Data:** 2026-09-10
- **Tarefa:** `E04-T06`
- **Escopo:** fundação visual do Kaizen
- **Fonte normativa:** [ADR 0001 — Fundação do Design System compartilhado](https://github.com/fradelli/design-system/blob/main/docs/decisions/0001-shared-design-system-foundation.md)
- **Evidência do release inicial:** [`@fradelli/ui@0.1.0` no commit `3e0c23f`](https://github.com/fradelli/design-system/blob/3e0c23f591ff458ab9e3e74dc44bb0cdba068a03/package.json)

## Contexto

A arquitetura aprovada em E03-T04 escolheu CSS Modules com tokens globais como fundação visual exclusiva e rejeitou Tailwind ou biblioteca de componentes para o P0. E04-T01 materializou esse estado transitório com tema claro, tokens locais e Arial.

Depois dessa aprovação, o repositório `fradelli/design-system` passou a concentrar a fundação visual comum dos produtos. Seu ADR 0001 define Tailwind CSS 4, Inter variável, estratégia dark-first, tokens e primitives sem domínio sob ownership externo. A versão `0.1.0` de `@fradelli/ui` foi publicada no GitHub Packages.

Esta decisão registra apenas as consequências específicas para o Kaizen. O ADR compartilhado continua sendo a fonte normativa; paleta, tokens e regras de admissão de componentes não são copiados para este repositório.

## Decisão

O Kaizen adotará `@fradelli/ui` como package externo e consumirá versões exatas. A primeira integração planejada será `@fradelli/ui@0.1.0`, depois de um gate de prontidão e sem dependência por tag, range, tarball local ou cópia de código.

A adoção ocorre em quatro passos:

1. E04-T06 registra a decisão e atualiza a arquitetura, sem instalar o package.
2. E04-T07 valida runtime, peers, exports, gates, CI e estratégia de autenticação, sem instalar o package, e emite GO ou NO-GO.
3. E04-T08, somente após GO, configura o GitHub Packages, instala a versão exata, integra Tailwind CSS 4, Inter, dark, CSS público e `@source`, e prova a fundação em `/foundations`.
4. E04-T04 cria o shell do Kaizen sobre a integração validada.

CSS Modules continuam permitidos apenas para layout e composição específicos do Kaizen. Eles não podem redefinir tokens, tipografia, foco, motion, estados genéricos ou primitives cobertos pelo package.

## Decisões anteriores substituídas

Esta decisão substitui somente os seguintes pontos de E03-T04:

| Ponto anterior | Novo estado |
| --- | --- |
| CSS Modules + tokens globais como fundação visual exclusiva | CSS público e primitives de `@fradelli/ui`, com Tailwind CSS 4 na integração; CSS Modules ficam restritos à composição local. |
| Tailwind ou biblioteca de componentes rejeitados de forma absoluta | Escolha histórica superada pelo contrato compartilhado e pelo consumidor real identificado. |
| Monorepo rejeitado porque não existia package reutilizado | Monorepo continua rejeitado para preservar ciclos independentes; compartilhamento ocorre por package versionado em repositório próprio. |

Continuam válidos e inalterados o Next.js full-stack, os boundaries de UI/aplicação/domínio/dados, PostgreSQL, Prisma, segurança, ownership de dados, Server Actions e a separação entre conteúdo público e registros operacionais privados.

Os resultados de E03-T04, E03-T05 e E04-T01 permanecem históricos. Esta decisão não reescreve seus documentos ou checklists.

## Ownership

### Design System

| Responsabilidade | Limite |
| --- | --- |
| Tokens visuais, tipografia, cores, radius, bordas, sombras, foco e motion | Contrato visual sem semântica de produto. |
| Estados visuais genéricos | Inclui estados como sucesso, aviso, informação e destrutivo. |
| Primitives acessíveis | Componentes genéricos e seus contratos/testes de acessibilidade. |
| Padrões comprovadamente compartilhados | Só entram após atender à governança do repositório normativo. |
| CSS público e exports | Superfície versionada consumida pelos aplicativos. |

### Kaizen

| Responsabilidade | Limite |
| --- | --- |
| Marca, metadata e assets | Identidade específica do produto. |
| Shell, layouts, páginas e rotas | Composição e navegação permanecem locais. |
| Dieta, treino, hábitos, tarefas e calendário composto | Domínio não é exportado pelo package. |
| Regras, autenticação, persistência, APIs, Server Actions e providers | Infraestrutura e comportamento do produto permanecem locais. |
| Textos e i18n | O aplicativo fornece toda copy específica, inclusive labels acessíveis. |
| Cores categóricas aplicadas ao domínio | O package fornece aparência; o Kaizen decide significado e sempre acompanha cor com outro indicador. |
| CSS de composição | Permitido somente quando não duplica foundations ou primitives. |

Imports fluem do Kaizen para `@fradelli/ui`. O Design System não importa código, rotas, textos ou tipos de domínio do Kaizen.

## Contrato publicado de `0.1.0`

O contrato foi verificado na tag `v0.1.0`, commit `3e0c23f591ff458ab9e3e74dc44bb0cdba068a03`:

| Item | Contrato publicado | Consequência para o Kaizen |
| --- | --- | --- |
| Package | `@fradelli/ui@0.1.0` | E04-T08 fixa a versão exata. |
| Registry | `https://npm.pkg.github.com`, acesso restrito | Instalação exige autenticação fora do Git. |
| Arquivos publicados | `dist` e `CHANGELOG.md` | `@source` aponta para o `dist` instalado, não para o repositório-fonte. |
| CSS público | `@fradelli/ui/styles.css` → `./dist/styles.css` | Importar uma única vez no CSS global. |
| Engine | Node `>=24.20.0 <25` | Compatível com Node 24.20.0 planejado no Kaizen. |
| Peers | React/React DOM `>=19.2.7 <20` | Compatível com React 19.2.8 planejado; E04-T07 reconfirma a base integrada. |
| Peer opcional | Tailwind CSS `>=4.3.0 <5` | Pins do consumidor são decididos com evidência em E04-T08. |
| Exports | `alert`, `badge`, `button`, `card`, `cn`, `field`, `input`, `label`, `separator`, `sheet`, `skeleton` | Consumir somente subpaths públicos; não importar arquivos internos. |

O package é dark-first e referencia `--font-inter`. O Kaizen carregará Inter variável uma vez no root, exporá essa variável e tornará a intenção dark explícita durante E04-T08.

## Registry e segurança

- O repositório pode versionar apenas o mapeamento público do scope `@fradelli` para o GitHub Packages.
- PAT, token, cookie, `_authToken`, valor de `NODE_AUTH_TOKEN` ou URL com credencial são proibidos no Git, em exemplos e em logs.
- Desenvolvimento local usa credencial no perfil do usuário, fora do projeto.
- CI usa credencial efêmera e permissão mínima `packages: read` somente quando E04-T08 introduzir o consumidor.
- Falha de autenticação interrompe a instalação. Não existe fallback por cópia, tarball local ou versão flutuante.

## Gates acumulados

- E04-T02 fornece formatação, lint, typecheck, testes e cobertura.
- E04-T05 adiciona CI com os mesmos gates e instalação congelada.
- E04-T07 reconfirma o contrato do release e emite GO/NO-GO sem instalar.
- E04-T08 prova instalação limpa, build, CSS, fonte, tema, acessibilidade, responsividade, React único e ausência de credenciais.
- E04-T04 preserva todos os gates ao construir o shell.

## Consequências

### Positivas

- Uma fonte normativa reduz divergência visual entre produtos.
- Versões exatas preservam a autonomia de upgrade e rollback do Kaizen.
- A fronteira impede que o package visual se torne uma camada `common` de domínio.
- Foundations são comprovadas antes de receberem navegação e telas operacionais.

### Custos e limitações

- Instalações locais e de CI precisam autenticar em registry privado.
- Versões `0.x` exigem reconfirmação do contrato e revisão de mudanças incompatíveis.
- Tailwind precisa detectar classes no artefato publicado por `@source` explícito.
- Durante a migração, estilos locais antigos precisam ser removidos sem apagar composição legítima.

## Pendências atribuídas

| Pendência | Tarefa responsável |
| --- | --- |
| Reexecutar gates na base integrada e confirmar engines/peers/exports | E04-T07 |
| Confirmar estratégia de autenticação local e do CI sem expor segredo | E04-T07 |
| Definir pins exatos de Tailwind CSS, `@tailwindcss/postcss` e PostCSS | E04-T08 |
| Confirmar o caminho relativo de `@source` a partir de `globals.css` | E04-T08 |
| Provar instalação congelada, build e uma única cópia de React | E04-T08 |
| Criar shell e navegação sem duplicar primitives | E04-T04 |

Nenhuma pendência acima autoriza placeholder ou valor estimado nesta tarefa.

## Riscos e controles

| Risco | Controle |
| --- | --- |
| Duplicar a fonte normativa | Referenciar o ADR compartilhado e manter aqui só consequências do Kaizen. |
| Consumir mudança incompatível em `0.x` | Fixar versão exata, revisar changelog e repetir o gate antes de upgrade. |
| Versionar credencial | Revisar diff e usar somente credenciais externas/efêmeras. |
| Omitir classes Tailwind do package | Validar o `@source` real e o CSS gerado em E04-T08. |
| Criar duas cópias de React | Respeitar peers e inspecionar a árvore instalada. |
| Recriar primitive local | Bloquear o shell até a integração e revisar imports/estilos. |
| Levar domínio ao package | Aplicar a matriz de ownership e rejeitar flags específicas de produto. |

## Rollback

Antes de E04-T08, cancelar a adoção significa reverter a PR documental desta decisão. A arquitetura visual anterior volta a vigorar sem remover dependência ou código.

Depois da integração técnica, esta decisão permanece no histórico. Uma mudança estrutural cria nova decisão substituta, restaura a última versão/configuração exata conhecida como boa e regenera o lockfile de forma revisada. Versões publicadas não são sobrescritas.

## Revisão

Revisar esta decisão quando:

- uma nova versão `0.x` trouxer mudança incompatível;
- os ciclos de release deixarem de ser independentes;
- surgir um terceiro consumidor incompatível;
- houver evidência para separar tokens de componentes;
- um padrão composto demonstrar uso real em dois produtos.

Qualquer mudança estrutural deve criar nova decisão que declare esta como substituída. A decisão não é alterada silenciosamente depois de usada por um release.
