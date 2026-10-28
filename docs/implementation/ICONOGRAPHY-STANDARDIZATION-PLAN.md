# Padronização de ícones — auditoria e plano

## Atualização de escopo em 27/10/2026

A versão **0.6.0** foi publicada pelo workflow oficial do Design System e instalada
por pin exato no Kaizen. PRs do pacote: [catálogo e Button](https://github.com/fradelli/design-system/pull/19)
e [versão](https://github.com/fradelli/design-system/pull/20). O catálogo oferece 1.512
desenhos da Phosphor 2.1.10 com exports individuais `@fradelli/ui/icons/<Nome>`;
o agregado permanece por compatibilidade.

Os símbolos e SVG de ação auditados foram substituídos no consumidor. O novo player
acrescenta StopIcon e CheckCircleIcon, este aprovado pelo usuário para registro direto
sem cronômetro. A auditoria abaixo permanece como evidência do estado anterior.

## Revisão após análise do catálogo completo

Esta revisão substitui a restrição inicial aos 11 exports. A direção passa a ser:
**disponibilizar todos os desenhos da versão fixada da Phosphor**, com API pública por
ícone e geração automática; manter o agregado atual por compatibilidade. As ocorrências
a corrigir no Kaizen e suas regras de acessibilidade permanecem as mesmas.

Evidência e limites: [Análise do catálogo](evidence/PHOSPHOR-CATALOG-EXPORT-ANALYSIS.md).

## Estado e decisão na auditoria

A auditoria original de 27/10/2026 não alterou componentes ou dependências. A execução
do catálogo foi autorizada posteriormente e concluída no release 0.6.0, conforme o resultado no início deste documento.

**Biblioteca única: Phosphor, consumida por `@fradelli/ui/icons`.** A navegação já usa
BarbellIcon e ForkKnifeIcon desse subpath. A implementação instalada desses wrappers
importa `@phosphor-icons/react/dist/ssr`. O X interno de Sheet também é Phosphor.
Não introduzir Lucide, emojis, SVG artesanal ou uma segunda origem pública de imports.

Há **10 pontos de renderização inconsistentes em 5 componentes**, cobrindo 11 ícones
únicos (alguns pontos alternam entre dois estados; X aparece em dois componentes).

## Evidências e limite da dependência

- Na auditoria original, Kaizen fixava `@fradelli/ui@0.3.0`; o subpath público instalado
  só expunha BarbellIcon e ForkKnifeIcon. Esse era o limite anterior ao release 0.6.0; os exports novos agora foram confirmados no pacote publicado.
- O checkout consultado na auditoria declarava 0.5.1 e expunha só esses dois no
  `src/icons/index.tsx`. Esse número local não prova qual release está publicado.
- Os 11 componentes Phosphor abaixo foram resolvidos e seus exports confirmados na
  dependência já instalada. Não foram inferidos nomes a partir de outra biblioteca.
- Fonte normativa local: Design System `docs/decisions/0001-shared-design-system-foundation.md`,
  `docs/governance/navigation-item-admission.md`, `docs/governance/versioning-and-releases.md`.
- A adoção no Kaizen é definida em `docs/decisions/SHARED-DESIGN-SYSTEM-ADOPTION.md`.

Consequência: a solução correta começa ampliando o subpath público no Design System,
publicando uma versão compatível e então atualizando o pin do Kaizen. Não importar
Phosphor como dependência transitiva nem fingir que os exports novos já existem.

## Inventário da aplicação

| Arquivo | Pontos atuais | Substituição |
|---|---|---|
| `src/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor.tsx` | SVG próprio do lápis; caractere + | PencilSimpleIcon; PlusIcon |
| `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.tsx` | Emoji 🗑 no modo compact | TrashIcon |
| `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.tsx` | Caractere × para fechar modal | XIcon |
| `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.tsx` | ▴/▾ para expandir; ▶/⏸ para retomar/pausar | CaretUpIcon/CaretDownIcon; PlayIcon/PauseIcon |
| `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.tsx` | ← e → entre séries; × para fechar comentário; 💬 no botão Comentário | ArrowLeftIcon; ArrowRightIcon; XIcon; ChatCircleIcon |

### O que já está correto ou não é um ícone de ação

| Elemento | Resultado da auditoria | Decisão |
|---|---|---|
| Navegação Treino/Dieta | BarbellIcon/ForkKnifeIcon via @fradelli/ui/icons | Preservar a família; tornar weight regular explícito para consistência |
| X interno de Sheet | Phosphor na implementação do pacote instalado | Preservar; não copiar nem editar dist/node_modules |
| Marca 改善 | Identidade do produto em texto japonês | Preservar, não substituir por ícone genérico |
| Barras de prioridade | Indicador quantitativo de três níveis, com rótulo acessível | Preservar como visualização de dados, não trocar por sinal de celular/ícone genérico |
| Setas de select e calendário/relógio de date/time | Controles nativos do navegador/SO | Preservar os inputs nativos; não criar picker customizado só por aparência |
| Botões Anterior/Hoje/Seguinte | Rótulos de texto, sem ícones improvisados | Preservar; não acrescentar pictogramas sem necessidade |
| Assets de marca/favicon | Nenhum arquivo de imagem/SVG encontrado em src na busca | Não inventar assets ou mexer em metadata |
| Demais rotas/estados/foundations | Sem outra biblioteca ou SVG artesanal encontrado no código do app | Conferir novamente na implementação, pois a base pode mudar |

A regra é para os ícones desenhados pela aplicação. Não implica substituir identidade,
indicadores de dados ou controles do sistema operacional. Se for desejado padronizar
pickers também, planejar isso separadamente, com seus próprios testes de acessibilidade.

## Padrão visual e acessível

- Família Phosphor, `weight="regular"` em todas as ações e navegação.
- Ações só com ícone: 20px; indicador de expansão: 16px; navegação: 24px, mantendo o
  tamanho atual da barra inferior. Usar os mesmos valores em estados alternados.
- Área clicável de pelo menos 44x44px para ação de ícone, sem aumentar o desenho para
  44px. Pausa/retomada, setas de série e fechar comentário precisam desta conferência.
- `currentColor`: herdar cor do botão/estado. Exclusão usa token destrutivo existente;
  não colocar vermelho no SVG nem sobrescrever tokens.
- No Button instalado, `[&>svg]:size-4` pode prevalecer sobre o atributo size do SVG.
  Aplicar a sobrescrita no botão, por exemplo `className="[&>svg]:size-5 min-h-11 min-w-11"`,
  quando necessário; conferir tamanho computado no navegador, não só JSX.
- Ícone decorativo sempre `aria-hidden="true"` e `focusable="false"`.
- O nome acessível pertence ao botão/link: Excluir atividade, Editar atividade: NOME,
  Adicionar atividade, Fechar formulário, Pausar atividade, Retomar atividade,
  Abrir série anterior, Abrir próxima série e Fechar comentário.
- Comentário conserva texto visível e aria-expanded. O ícone não duplica o anúncio.
- Expandir conserva nome do treino e aria-expanded; alternar caret não muda o nome.
- Estados disabled, pending, foco, cores e hit area continuam no botão, não no ícone.
- Não criar aliases de domínio no pacote (DeleteTrainingIcon, WorkoutEditIcon).
  Exports devem usar os nomes visuais genéricos da tabela.

## Etapa A — Design System com catálogo completo

Trabalhar no repositório fradelli/design-system, em branch própria, com conteúdo e
commits em inglês, Changeset minor compatível e publicação pelo Release de main.
Nesta análise o repositório foi apenas lido. Não publicar localmente.

| Ação | Arquivo/área no DS | Resultado |
|---|---|---|
| Criar | scripts/generate-icons.mjs | Gerador determinístico com modo check, usando somente a dependência instalada |
| Criar | src/icons/catalog.json | Manifesto versionado do catálogo admitido; cada desenho com nome e módulo SSR verificados |
| Gerar | src/icons/generated | Entradas por ícone; nomes canônicos, sem registrar todos em objeto runtime |
| Editar | src/icons/index.tsx | Preservar IconProps/BarbellIcon/ForkKnifeIcon e ampliar catálogo agregado com exports nomeados |
| Editar | package.json | Exports públicos por ícone e scripts de generate/check; manter raiz existente |
| Editar | scripts/validate-package.mjs | Validar manifesto/artefatos, allowlist e resolução dos targets individuais/wildcards |
| Criar | src/icons/icons.test.tsx e fixture de pacote | Cobertura de catálogo, props, ícones antigos/novos e tipos SSR/client |
| Criar | src/stories/foundations/Icons.stories.tsx | Exemplos representativos; não montar todo catálogo no carregamento inicial |
| Criar | .changeset/complete-phosphor-catalog.md | Ampliação compatível e contrato de versão fixada |

Os 11 ícones usados na migração inicial do Kaizen são um subconjunto do catálogo,
não uma allowlist de desenhos disponíveis. Não exportar SSRBase/Context por acidente.
A seleção completa, o contrato de subpaths e os gates estão na revisão executável
no final e no documento de evidências. Não antecipar número de release publicado.

## Etapa B — Atualização controlada do consumidor

| Ação | Arquivo no Kaizen | Verificação |
|---|---|---|
| Editar | `package.json` | Fixar a versão exata realmente publicada de @fradelli/ui, sem ^, latest ou path local |
| Gerar | `pnpm-lock.yaml` | Atualização pelo pnpm; não editar integridades ou dependências transitivas manualmente |
| Conferir | Export instalado e changelog | Os 13 nomes resolvem; revisar todas as alterações entre 0.3.0 e a nova versão, não tratar upgrade como se trouxesse somente ícones |

O checkout do Design System já está além da versão usada no Kaizen. O upgrade pode
incluir correções de Button, layout e componentes. Testar o impacto real antes de
aceitar o pin. Se houver incompatibilidade, resolver no DS/upgrade com evidência;
não contornar por cópia de dist, tarball local ou acesso ao interior do pacote.

Gate de continuação: só trocar os ícones da UI depois que imports e tipos do artefato
publicado forem comprovados. Não instalar @phosphor-icons/react diretamente no Kaizen
como atalho: isso criaria dois contratos de consumo para a mesma identidade.

## Etapa C — Substituições no Kaizen

Aplicar na ordem abaixo, usando exclusivamente os subpaths públicos por ícone
do Design System, após a versão com esses exports estar publicada.

### C1. `src/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor.tsx`

Substituir SVG próprio do lápis; caractere + por PencilSimpleIcon; PlusIcon.

Preservar ref do gatilho, aria-label, disabled, aria-busy e transition. Não mudar a abertura do modal. Remover o SVG inteiro e seus paths. Plus só no modo de inclusão.

### C2. `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.tsx`

Substituir Emoji 🗑 no modo compact por TrashIcon.

Alterar somente a apresentação compact. Rodapé mantém texto Excluir atividade. Preservar confirmação, pending, revisão, limpeza de cache e callbacks. Emoji não deve permanecer em branch alternativa.

### C3. `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.tsx`

Substituir Caractere × para fechar modal por XIcon.

Manter botão de 44px, label Fechar formulário, cancel guard, retorno de foco e controle de Tab. X não captura clique ou foco independentemente do botão.

### C4. `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.tsx`

Substituir ▴/▾ para expandir; ▶/⏸ para retomar/pausar por CaretUpIcon/CaretDownIcon; PlayIcon/PauseIcon.

Expandido usa CaretUp, recolhido CaretDown; pausado usa Play para Retomar e em andamento usa Pause. Preservar onClick e labels. Não confundir o estado atual com a ação representada.
O novo transporte também usa StopIcon de @fradelli/ui/icons/Stop, conforme o plano
de player; a abertura do modal não conclui nem exclui a atividade.

### C5. `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.tsx`

Substituir ← e → entre séries; × para fechar comentário; 💬 no botão Comentário por ArrowLeftIcon; ArrowRightIcon; XIcon; ChatCircleIcon.

Preservar disabled de navegação entre séries e regras de habilitação da próxima. X só fecha comentário; ChatCircle acompanha o texto Comentário. Não alterar valores, rascunhos ou validação dos exercícios.

### C6. Navegação principal

Arquivo: `src/components/shared/app-shell/components/app-shell-navigation/components/app-shell-navigation-links/app-shell-navigation-links.tsx`.
Os ícones já são corretos. Aplicar somente weight regular explícito se o padrão for
normalizado na chamada. Preservar aria-current, aria-label, labels no desktop e nomes
acessíveis quando os rótulos estiverem ocultos no celular. CSS atual de 24px é a referência.

## Etapa D — Proteção contra reincidência

Editar `eslint.config.mjs` com regra de import para UI: ícones entram somente pelo
subpath público `@fradelli/ui/icons`. Proibir imports diretos de Phosphor/deep paths e
bibliotecas concorrentes no app. Os imports internos do próprio Design System são
responsabilidade do outro repositório e não são afetados por essa regra.

Acrescentar uma checagem focada em `scripts/validate-ui-icons.mjs` e testes em
`scripts/validate-ui-icons.test.mjs`, com parser AST do TypeScript já instalado.
Ligá-la a `structure:check` e seus testes a `test:ci-scripts` em package.json.

A checagem deve identificar SVG artesanal em TSX de UI e o conjunto de símbolos
improvisados da auditoria em JSXText e literais de expressões JSX. Não usar regex global
que proíba + em matemática, setas em conteúdo textual ou cores em outros domínios.
Testar positivo/negativo: emoji em botão, literal condicional de pause, SVG próprio,
texto de dose 3+ repetições, marca japonesa, texto do usuário e indicadores de barras.
Assets de marca não são componentes de ação; exceções futuras precisam ser nomeadas e
justificadas, nunca um ignore amplo que torne a regra inútil.

Não criar AppIcon por nome/string nem um registry global que importe todos os símbolos.
A API de componentes nomeados já resolve consistência e evita mais uma camada.

## Validação e aceite

1. Rodar formato, lint, structure:check e typecheck após atualizar o pacote/imports.
2. Testar ícones no artefato DS e seus estados/tamanhos no Storybook.
3. No Kaizen, preservar testes existentes por role/nome acessível; não testar pelo emoji.
4. Nos testes de editor/modal/card, verificar nomes, ações e estados após a troca.
5. Acrescentar ou localizar testes de navegação entre séries/comentário; esse componente
   não tinha teste próprio no caminho auditado. Criar teste na pasta do componente se
   cobertura existente não demonstrar os estados exigidos.
6. Conferir no navegador 320px, 390px e desktop: lixeira/lápis/+, alinhamento, regular,
   currentColor, tamanhos computados, hit area, foco, disabled e pending.
7. Fazer exercício/pausa/retomada/comentário/série, sem alterar o treino salvo apenas
   para testar ícones; usar fixtures ou banco descartável quando houver mutação.
8. Rodar test:coverage, test:ci-scripts, data:check e build; repetir integração se o
   upgrade de DS ou alguma mudança efetiva afetar os contratos de UI/Server Actions.
9. Conferir bundle/tarball: imports nomeados não podem puxar catálogo completo ou uma
   segunda versão de Phosphor. Comparar build e dependências antes/depois.
10. Nenhuma mudança de schema, plano, cronômetro, regras de rascunho ou remarcação.

- [ ] As ocorrências originais e o novo transporte usam os desenhos públicos, incluindo StopIcon.
- [ ] Todos os ícones desenhados pela aplicação usam o mesmo subpath/família.
- [ ] Barbell/ForkKnife e X interno de Sheet continuam consistentes.
- [ ] Nenhum emoji, SVG próprio ou caractere de ação ficou nos pontos auditados.
- [ ] Botões mantêm nomes, estados, foco e ações; ícones decorativos não são anunciados.
- [ ] Tamanhos 16/20/24 e áreas de toque foram conferidos no CSS computado.
- [ ] Inputs nativos, marca e visualização de prioridade foram preservados.
- [ ] Publicação DS e upgrade exato do Kaizen possuem evidências separadas.
- [ ] Checks de regressão e proteção contra reincidência passam.

## Entrega, esforço e rollback

Duas PRs: uma no Design System para a API/release, outra no Kaizen para pin/imports e
padronização. Não misturar essa correção com a PR de modais já aberta, sem necessidade.
Antes de implementar, verificar se a PR #71 foi integrada e escolher a base correta.

Esforço preliminar: 1–2h para API/testes do DS; 1–2h para migração no Kaizen; 1–2h para
checagens/regressão visual. Total aproximado 3–6h de trabalho, além da espera por revisão
ou publicação. Não é uma reescrita de telas; a dependência de release é o maior cuidado.

Rollback: reverter a PR do Kaizen e seu pin/lockfile para a versão anterior. Release
publicado é imutável: corrigir por novo release; nunca sobrescrever versão ou copiar dist.
Nenhum dado operacional precisa de rollback.

## Prompt de implementação

Usar o prompt atualizado da revisão executável abaixo. Ele substitui o plano inicial
restrito aos 11 ícones de uso imediato.

## Revisão executável — API completa sem dependência de release por uso

A implementação desta seção prevalece sobre a Etapa A original e sobre o prompt antigo.

1. No DS, adicionar gerador e manifesto do catálogo instalado. Ler os exports/módulos
   SSR da dependência fixada, verificar o componente esperado em cada entrada e gerar
   entradas individuais com nomes canônicos terminados em Icon. Não inventar aliases.
2. Preservar IconProps e os wrappers públicos já existentes. Ampliar src/icons/index.tsx
   com exports nomeados gerados, sem encaminhar SSRBase ou Context sem decisão explícita.
3. Gerar entradas em src/icons/generated para todos os desenhos, não somente os 11 de
   uso atual. Expor pelo package um subpath público como @fradelli/ui/icons/Trash,
   com alvos import/types para os arquivos gerados e emitidos pelo build.
4. O gerador deve ser determinístico, ter modo check e manifesto versionado. Upgrade
   de Phosphor precisa mostrar adições/remoções; build não pode buscar catálogo na rede.
5. Adaptar scripts/validate-package.mjs: a allowlist atual é estática e os targets
   wildcard não são arquivos literais. Validar cada entrada por manifesto e impedir
   arquivos inesperados. Não flexibilizar o gate para aceitar qualquer dist.
6. Confirmar que types em subpaths, refs e SSR funcionam no artefato publicado. Se forem
   criados arquivos-fonte gerados, versionar conforme a política do DS; dist continua
   sendo artefato de build e não é editado nem commitado manualmente.
7. Manter Storybook com exemplos representativos e tamanhos/pesos, sem montar os 1.512
   desenhos numa única tela por padrão. Catálogo amplo de demonstração pode ter busca
   e carregamento separado, sem virar registry que o consumidor importe.
8. No Kaizen, preferir imports individuais, por exemplo TrashIcon de
   @fradelli/ui/icons/Trash. A regra de import aceita @fradelli/ui/icons e seus novos
   subpaths públicos; continua proibindo imports diretos/transitivos de Phosphor.
9. Não alterar next.config só para contornar o custo do barrel. Caso se queira manter
   imports agregados nos consumidores, provar a otimização da fachada no Next antes
   de recomendá-los indiscriminadamente. Não presumir optimizePackageImports automático.
10. Comparar instalação/tarball/dev/HMR/build/bundle de cliente na versão publicada.
    Os dados do experimento isolado não são métricas finais da aplicação.

O catálogo inteiro se torna parte do contrato do DS, vinculado à versão fixada da
Phosphor. Novos usos de desenhos já publicados não exigem nova publicação; novos
ícones de versões futuras da Phosphor continuam exigindo um upgrade controlado.
O esforço inicial de 3–6h do plano restrito precisa ser reavaliado: geração, manifesto,
subpaths, tarball e testes Next são trabalho adicional. Medir por gates, sem prometer
que exportar tudo é só acrescentar uma linha.

### Prompt atualizado

> Execute o plano com a revisão de catálogo completo e a análise de evidência.
> Disponibilize todos os desenhos da versão fixada da Phosphor pelo Design System,
> com geração determinística e entradas públicas por ícone, preservando os exports
> existentes. Não criar registry dinâmico, usar root CSR no servidor ou expor helpers
> da Phosphor sem decisão. Atualize o gate de tarball para os módulos/subpaths novos
> com manifesto fechado. Prove tipos/SSR/client em Next e instalação npm/pnpm a partir
> do artefato. O experimento esbuild não substitui teste real do consumidor. Depois
> publique pelo workflow autorizado, atualize o pin do Kaizen e corrija os 10 pontos
> auditados. Use imports individuais do próprio DS; preserve labels, foco e estados.
