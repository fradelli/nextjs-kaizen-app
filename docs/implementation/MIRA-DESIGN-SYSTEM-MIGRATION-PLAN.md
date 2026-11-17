# Plano de conclusão da migração Mira

Planejamento solicitado em 13/11/2026. Este documento organiza a execução;
o [guia de estilo](../product/telas/guia-de-estilo.md) continua sendo a fonte
visual e o [inventário](../product/telas/componentes-shadcn.md) registra a adoção.
Não comprova aceite visual, conclusão de tarefas ou publicação.

Execução registrada em [E10-T09](../../roadmap/epics/E10-portfolio-visual-alignment/T09-complete-mira-adoption.md).
A preparação local e o primeiro formulário já têm evidências no inventário;
o diagnóstico abaixo preserva o estado anterior à aplicação da migration e à
troca do candidato. Não repetir essas etapas sem conferir o checkpoint atual.

## Objetivo e limites

Concluir a adoção de `@fradelli/ui` em todas as rotas existentes. Componentes,
variantes, tokens, tipografia, ícones e estados visuais genéricos pertencem ao
pacote. O Kaizen mantém domínio, conteúdo, i18n, URLs, persistência e composição
específica. Não acrescentar funcionalidades futuras da agenda ou alimentação.

O escopo inclui o catálogo completo do preset solicitado, mas sua reconstrução
é uma frente própria do design system. A validação das telas do Kaizen pode
avançar por lotes sem alegar que o catálogo inteiro já foi entregue.

## Entradas e responsabilidades

- `AGENTS.md` e `roadmap/ACTIVE.md`: estado de retomada e preservação do trabalho.
- `docs/architecture/TARGET-ARCHITECTURE.md`: Semântica e legibilidade do código,
  Boundaries, Organização dos componentes React, Server Components e Client Components.
- `docs/product/telas/guia-de-estilo.md`: decisões visuais vigentes.
- `docs/product/telas/componentes-shadcn.md`: inventário e evidências por tela.
- `docs/product/telas/agenda-padroes-visuais.md`: comportamento e geometria da agenda;
  referências históricas conflitantes não substituem o guia vigente.
- `docs/decisions/SHARED-DESIGN-SYSTEM-ADOPTION.md`: distribuição e ownership.
- No design system: `AGENTS.md`, `docs/decisions/0001-shared-design-system-foundation.md`,
  `docs/governance/component-admission.md`, `shared-ui-style.md`,
  `versioning-and-releases.md`, `base-mira-catalog.md` e `select-validation.md`,
  todos os últimos caminhos relativos a `docs/governance/`.

As decisões do Kaizen não substituem silenciosamente o ADR externo. Registrar
no design system a evolução aprovada para Mira, Lucide, IBM Plex Sans e Figtree,
incluindo quem fornece arquivos de fonte, licença e como o consumidor os carrega
uma única vez, sem dependência do pacote em Next.js.

## Diagnóstico de ambiente desta sessão

| Verificação | Evidência atual | Consequência |
| --- | --- | --- |
| Leitura e escrita nos dois repositórios | Arquivos temporários criados, lidos e removidos | Edição local disponível |
| Git local e remoto do DS | Status nos dois projetos e `ls-remote` do DS aprovados | Preservar alterações existentes; escrita remota não foi testada |
| Links no Windows | Symlink comum retorna `EPERM`; junction de diretório funciona | Restrição residual do Windows; não equivale a falha geral do pnpm |
| Instalação do candidato | Instalação isolada com pnpm 11.25.0 aprovada, scripts e auto-instalação de peers desativados | Store e dependências acessíveis; ainda validar instalação completa do consumidor |
| Build do Kaizen | `pnpm build` aprovado, incluindo geração Prisma e TypeScript | O erro anterior de cache SWC não se repetiu |
| Navegador | Chromium headless abriu página HTTP local | Automação local disponível; jornadas do produto ainda não validadas |
| Docker | Daemon disponível após abertura pelo usuário; serviço `database` iniciado e saudável | Confirmar conexão, migrations e dados antes da jornada |
| PostgreSQL e migrations | `SELECT 1` aprovado; `pnpm db:status` identificou `20261108010000_exercise_catalog` pendente entre 16 migrations | Conexão disponível; revisar/aplicar a migration local na preparação, não aplicada neste diagnóstico |
| Dependência atual | Manifesto e instalação ainda usam candidato `forms`; Select não exportado | Não confundir fonte do DS com API instalada |

O candidato foi instalado em diretório temporário; manifesto e lockfile do Kaizen
não foram trocados neste diagnóstico. A primeira tentativa isolada não fixava o
package manager e falhou por cache offline; a repetição fixou a versão do projeto
e passou com rede. Isso não constitui aceite de peers ou execução de scripts.

## Sequência e critérios de avanço

### 1. Estabilizar e registrar a base

1. Conferir Git nos dois projetos e classificar as alterações já existentes por
   entrega. Não recriar branch, descartar arquivos ou misturar documentação anterior.
2. Confirmar banco com consulta de leitura e `pnpm db:status`. Havendo migrations
   pendentes, revisar o destino local e o efeito antes de aplicá-las. Não usar reset.
3. Conferir workspace e fixtures disponíveis. Para jornadas com escrita, usar dados
   sintéticos identificáveis e banco de teste separado quando aplicável.
4. Antes de implementar, registrar/selecionar a tarefa correspondente no roadmap,
   com entradas, dependências e critérios deste plano; não reabrir tarefas DONE.
5. Registrar versão do Node/pnpm, candidato, hash, fonte do pacote e checks iniciais.

**Saída:** ambiente utilizável, dados de validação definidos e tarefa selecionada.

### 2. Fechar inventário e contrato do pacote

1. Partir de `src/app` e seguir apenas as árvores renderizadas das rotas `/workout`,
   `/workout/activity/[occurrenceKey]`, sua interceptação em `@workout`, `/nutrition`,
   `/foundations`, shell, erros e carregamentos. Conferir redirecionamentos existentes.
2. Para cada interação, registrar no inventário: rota, elemento, arquivo responsável,
   implementação, export público escolhido, override a retirar e validação necessária.
3. Inspecionar CSS global, Modules, `*.styles.ts`, utilitários e estilos inline.
   Incluir seletores descendentes e sobrescritas em componentes já importados do DS.
4. Reconciliar fonte, manifesto, módulos emitidos, tarball e Storybook do DS.
   O inventário histórico de 20 presentes não acompanha necessariamente Accordion
   já encontrado na fonte; recontar a base sem atualizar números por suposição.
5. Separar primitivas, composições genéricas e layout de produto. Resolver primeiro
   Select, Tooltip, Textarea, Empty, exports Lucide e aparência categórica dos cards
   conforme os consumidores reais confirmados. Verificar também os contratos dos
   componentes já presentes, inclusive Dialog, DropdownMenu e Collapsible.

**Saída:** matriz sem controles visuais locais sem destino ou exceção justificada.

### 3. Preparar e validar o design system

1. Reutilizar o preset `b1HwjY1BI0`; confirmar receitas oficiais, versão da CLI e base
   antes de gerar. Registrar procedência e diferenças intencionais. Base UI aparece
   no candidato; sua formalização deve respeitar a governança do pacote.
2. Evoluir tokens DTCG e gerar CSS pelo script oficial. Não editar CSS gerado,
   `dist`, tarballs ou lockfiles de fixtures manualmente.
3. Centralizar cores semânticas, foco, raio, sombra, dimensões e tipografia. Expor
   variantes genéricas sem nomes de treino, esportes ou flags de aplicação.
4. Centralizar Lucide em exports públicos e definir transição dos exports legados
   sem quebrar consumidores silenciosamente. Remover imports diretos no Kaizen
   somente depois que os novos caminhos funcionarem no artefato distribuído.
5. Para cada lote do catálogo: fonte, export, tipos, estilo, story, interação,
   empacotamento e consumidor. Reconciliar as 65 entradas históricas; distinguir
   receitas existentes de nomes sem receita, como o checkpoint de `form`.
6. Validar compatibilidade de formulários, referências, SSR e limites client.
   Select deve preservar nome/valor, envio, desabilitado e seleção por teclado.
7. Produzir candidato identificável por hash. Declarar impacto SemVer e Changeset;
   versões 0.x com alterações visuais incompatíveis exigem análise explícita.

**Saída:** candidato distribuível e importável, com histórias e testes dos lotes
necessários. O catálogo completo tem aceite próprio; não adicionar dependências
sem a justificativa de consumidor exigida pelo repositório.

### 4. Instalar o candidato pelo fluxo real

1. Conferir hash e conteúdo do candidato e instalar com pnpm 11.25.0 no Kaizen.
2. Atualizar manifesto e lockfile juntos pelo gerenciador; não copiar módulos.
3. Executar imports reais dos subpaths consumidos e conferir tipos, CSS e fontes.
4. Validar um formulário com Select dentro de Dialog, Checkbox e Button neutro;
   conferir foco, geometria, envio e comportamento mobile antes de ampliar a troca.

**Saída:** consumidor usa exatamente o artefato validado; tarball continua sendo
prévia local, sem se apresentar como release publicado.

### 5. Migrar por fluxo

| Ordem e arquivos de partida | Trabalho | Aceite observável |
| --- | --- | --- |
| Executor: `src/features/training/ui/components/training-day-page/components/training-activity-card/` e `training-session/` | Campos, confirmação, prescrição, anterior, descanso, aquecimento, histórico e correção | Prévia bloqueada e contador parado; iniciar habilita execução; confirmar série mantém regra de descanso e persistência; rascunho recuperável |
| Aquecimento e overlays: componentes internos do executor e `src/features/training/ui/components/training-workout-overlay/` | Collapsible, rotina só de aquecimento, rota direta/interceptada e diálogos aninhados | Aquecimento isolado sempre aberto; sem controles indevidos de séries; Escape, retorno do foco e rolagem corretos |
| Agenda: `src/features/training/ui/components/training-week-grid/`, seu filho `components/training-grid-event/` e `training-day-page/components/training-date-navigation/` | Cards, título, horário, status, categorias, Hoje, setas, seletor, menus e dicas | Mesma tipografia calculada em texto/link/botão; sete dias desktop, um mobile; eventos curtos acionáveis; scroll estável; atalhos respeitam campos e overlays |
| Formulários: `training-day-page/components/training-activity-form/`, `training-activity-editor/` e componentes de conclusão/exclusão | Field, Input, Select ou NativeSelect conforme interação, Textarea, mensagens, PendingButton e confirmações | Nomes e payloads preservados; erros associados; cancelar preserva comportamento; envio pendente impede duplicidade; descartar execução e excluir atividade continuam distintos |
| Rotas comuns: `src/components/shared/`, `src/features/foundations/`, `src/app/nutrition/page.tsx` | Navegação, placeholders, vazio, loading e erros | Componentes e ícones públicos, seleção acessível, nomes de ações por ícone; nenhum recurso novo de alimentação |

Em cada linha: conferir o trabalho existente, trocar somente o necessário,
remover overrides redundantes, executar regressões pertinentes e atualizar a
matriz. Não acumular todas as telas sem validar o primeiro fluxo.

### 6. Revisar organização e remover concorrência visual

- `*.tsx`: semântica, composição e ligação a eventos do produto.
- `*.types.ts`: props e contratos locais; não duplicar tipos exportados pelo pacote.
- `*.constants.ts`: defaults e listas semânticas realmente compartilhadas.
- `*.styles.ts`: composição densa de classes; `*.module.css`: geometria específica
  com tokens públicos. Não criar ambos sem necessidade concreta.
- `*.utils.ts`: transformações puras; `hooks/use-*.ts`: estado, efeitos e integração
  de interação. Regra de negócio fica em domínio/aplicação, não num hook visual.
- Cada componente tem pasta própria; auxiliares privados pertencem ao consumidor.
  Não criar arquivos vazios ou wrappers sem responsabilidade.
- Preservar Server Components e o menor limite client; nenhuma dependência de dados,
  Prisma, segredos ou adapters entra na UI client.

CSS local permitido inclui posição/duração de eventos, colunas, rolagem, safe area
e posição do contador. Cores, tipografia, borda, sombra, dimensão de primitivas,
foco e estados genéricos devem vir do DS. Quando a necessidade expõe uma lacuna
genérica, corrigir o pacote antes de concluir a tela. Documentar exceções reais
com arquivo, responsabilidade e razão; não usar a exceção para duplicar uma receita.

### 7. Validar e preparar a entrega

**Automação:** checks proporcionais a cada lote; na integração final executar
`pnpm run ci` no Kaizen e `npm run ci` no DS, respeitando bancos de teste e fixtures.
Incluir instalação congelada limpa, consumidores npm/pnpm, Storybook, tarball,
traduções, estrutura, boundaries, ícones e `git diff --check`. Não confundir
`pnpm ci` com o script de gates. Registrar falhas anteriores separadamente das novas.

**Navegador:** ao menos 390 px e 1440 px, mais 320 px para overflow e casos longos.
Percorrer agenda → prévia → iniciar → preencher → confirmar série → descanso →
sair/retomar → finalizar; formulário → erro → cancelar/reabrir → envio; diálogo
aninhado → Escape → foco restaurado; navegação → alimentação → foundations.
Usar teclado e emulação de toque, conferir zoom, nomes longos, disabled/pending,
contraste e estilo calculado. Emulação não substitui aparelho físico para teclado
virtual e safe area: registrar essa pendência quando não houver dispositivo.

**Evidências:** tabela por tela com componente, estilo local restante, cenário,
resultado, viewport e artefato. Capturas e logs não contêm dados privados. Testes
unitários não comprovam aceite visual; build não comprova acesso às rotas dinâmicas.

**Release e integração:** primeiro revisar o candidato local. Depois preparar ADR,
Changesets e PRs por repositório. Publicar o DS exclusivamente pelo workflow
Release em `main`; consumir versão publicada exata no Kaizen, atualizar lockfile,
repetir instalação limpa e smoke das jornadas críticas. Remover referência local
somente quando a versão publicada equivalente estiver validada. Rollback usa
versão anterior imutável e alterações isoladas, sem descartar o restante do worktree.

## Critérios de conclusão

- [ ] Inventário cobre rotas, estados e overlays existentes.
- [ ] Componentes e aparência compartilhados vêm de exports públicos do DS.
- [ ] Lucide é consumido pelo contrato do pacote; tipografia não é duplicada.
- [ ] CSS local restante tem responsabilidade de composição documentada.
- [ ] Contratos, URLs, persistência, rascunhos e regras de execução preservados.
- [ ] Testes e jornadas desktop/mobile aprovados com evidência do artefato.
- [ ] Reconstrução do catálogo possui contagem e aceite independentes verificáveis.
- [ ] Entrega final usa versão publicada exata e instalação limpa validada.
- [ ] Roadmap, inventário e changelog refletem apenas conclusões comprovadas.

## Próxima ação

Consultar o resultado de E10-T09, reconciliar o inventário do candidato do DS e
continuar pelo executor. Migration, workspace e primeiro Select foram preparados
na retomada documentada no inventário. Este planejamento não inicia
publicação, merge, deploy ou funcionalidades futuras.
