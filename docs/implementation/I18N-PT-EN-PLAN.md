# Plano de internacionalização — português e inglês

Status: proposta de implementação, baseada no repositório em 29/10/2026. Este documento entrega planejamento; não é um pacote de código pronto para copiar. Não houve alteração de aplicação ou banco.

Atualização de execução: a interface atual foi implementada e validada; escopo, evidências e limites em [I18N-UI-IMPLEMENTATION.md](I18N-UI-IMPLEMENTATION.md). A estratégia de banco abaixo permanece uma proposta para conciliar com o catálogo novo.

## 1. Objetivo e limites

Entregar interface e conteúdo editorial em português brasileiro e inglês, escolhidos automaticamente pelo idioma preferido do navegador. O navegador informa preferências, normalmente herdadas do sistema; uma aplicação web não consegue garantir acesso direto à configuração do sistema operacional.

Requisito confirmado: inglês e português, com detecção automática. Recomendações deste plano: `pt-BR` e `en`, inglês como fallback para idiomas não suportados e seletor opcional Automático / Português / English. Espanhol fica fora desta primeira entrega. Documentação humana continua em português conforme AGENTS.md; English-first para documentação não foi solicitado.

## 2. Diagnóstico do projeto

- Next.js App Router, React, PostgreSQL e Prisma com modelos separados em `prisma/models/`.
- `src/app/layout.tsx` fixa `lang="pt-BR"` e descrição em português.
- `data/exercises.json` contém IDs estáveis, `name_pt`, objetivo, aplicação, instruções, dicas, erros e riscos. Traduzir apenas nomes deixa parte importante do produto no idioma anterior.
- `persist-reviewed-exercise-definitions.ts` grava `definition.name_en ?? definition.name_pt` em `namePt`. Portanto, o nome da coluna não prova o idioma do valor existente.
- `prisma-training.mapper.ts` e `prisma-training-repository.ts` exibem `exercise.namePt` diretamente.
- `ExerciseDefinition` identifica uma definição por exercício e lotes da biblioteca/metadados. Um mesmo ID editorial pode ter várias versões persistidas.
- Sessões possuem `name` e `notes`; prescrições possuem `prescribedText`, `notes` e dose normalizada. Esses textos também precisam de estratégia.
- Há formatadores com locales fixos. Alguns servem para cálculo de datas civis, outros para exibição: não substituir todos mecanicamente.
- O P0 usa workspace único sem autenticação. Preferência de idioma não pode ser salva globalmente nesse workspace, pois um visitante mudaria o idioma de todos.
- Já existe E09-T05 no roadmap, com escopo mais amplo e dependências antigas. Esta proposta não declara a tarefa concluída nem altera decisões aprovadas.

## 3. Escolha do idioma

Resolver no servidor, em cada requisição, nesta ordem:

1. Cookie de escolha explícita válido (`en` ou `pt-BR`), caso o seletor seja implementado.
2. `Accept-Language`, respeitando prioridades `q`, ignorando entradas inválidas e valores com `q=0`.
3. `en` quando não existir preferência compatível.

Mapear variantes `en-*` para `en` e `pt-*` para `pt-BR`. Uma preferência francesa seguida de português deve resultar em português. Não usar teste de substring. Usar negociação testada e allowlist; nunca construir caminho de importação a partir de texto recebido.

| Preferência | Resultado |
|---|---|
| `en-US,en;q=0.9,pt-BR;q=0.8` | Inglês |
| `pt-PT,pt;q=0.9` | Português brasileiro |
| `fr-FR,pt-BR;q=0.8,en;q=0.5` | Português brasileiro |
| ausente, inválida ou apenas idioma não suportado | Inglês |
| escolha manual Português + navegador inglês | Português brasileiro |

Modo Automático remove o cookie de escolha; não persistir detecção automática como override, para acompanhar mudanças posteriores do navegador. Cookie sugerido: `kaizen_locale`, path `/`, SameSite Lax, Secure em produção, duração de um ano, escrita pelo servidor. Não é credencial. Nenhuma nova variável secreta é necessária.

O HTML inicial, os Server Components e o provider do cliente devem compartilhar o mesmo locale. Não detectar somente em `useEffect`: isso mostra primeiro o idioma errado e pode causar divergências de hidratação. Uma mudança de preferência deve atualizar a rota preservando dados já salvos; proteger rascunhos antes de remontar componentes.

## 4. UI, biblioteca e rotas

Recomendo `next-intl`, com configuração por requisição e sem prefixo de idioma nas URLs. Confirmar a versão compatível com as versões efetivamente instaladas durante o spike e fixá-la no lockfile. A biblioteca documenta suporte ao App Router e exemplo sem roteamento por locale.

Preservar `/`, `/treino` e `/dieta`. O texto de navegação muda; o endereço permanece. Isso evita migração de links existentes e atende ao P0 com indexação desabilitada. Prefixos `/en` e `/pt-BR` podem ser reconsiderados quando houver páginas públicas com SEO por idioma.

Catálogos `messages/en.json` e `messages/pt-BR.json`, com chaves semânticas agrupadas por `common`, `navigation`, `today`, `training`, `nutrition`, `validation` e `accessibility`. Usar frases completas, parâmetros e pluralização ICU, sem concatenar fragmentos traduzidos. Tipar chaves a partir do catálogo de referência inglês.

Incluir botões, títulos, descrições, placeholders, estados vazios, loading, erros, confirmações, tooltips, mensagens de validação, nomes acessíveis e metadata. Server Actions devolvem códigos estáveis e parâmetros; a apresentação traduz. Regras de domínio não importam biblioteca de tradução.

Fallback de UI: catálogo inglês para chave ausente em português; falhar no CI se houver divergência de chaves ou parâmetros. Em produção, registrar chave ausente sem dados pessoais. A entrega inicial exige ambos os catálogos completos.

Cache deve distinguir locale e revisão do conteúdo. Dados estruturais podem ser compartilhados; resultados já traduzidos não podem usar uma chave global. Confirmar em produção que CDN e cache da aplicação não servem HTML português para visitante inglês.

## 5. Banco: uma definição, várias traduções

Não criar dois exercícios independentes nem dois planos apenas para trocar idioma. Identidade, relações, séries, cargas, resultados, enums e regras permanecem únicos. Traduções são uma camada ligada à versão da definição.

Modelo recomendado: nova tabela `exercise_definition_translation`, com relação para `ExerciseDefinition.id`. Não relacionar exclusivamente pelo `exerciseId` editorial: isso poderia aplicar instruções atuais a uma versão histórica diferente.

| Campo proposto | Conteúdo e regra |
|---|---|
| `exerciseDefinitionId` | FK UUID para a versão exata; exclusão restrita |
| `locale` | `en` ou `pt-BR`; allowlist no importador e constraint no banco |
| `revision` | Inteiro positivo; revisão editorial da tradução |
| `name` | Nome não vazio, revisado |
| `content` | JSONB validado: objetivo, aplicação, instruções, dicas, erros e riscos; arrays mantêm ordem |
| `sourceHash` | SHA-256 do conteúdo-fonte traduzível daquela versão |
| `translationHash` | SHA-256 da tradução normalizada, para detectar conflito |
| `createdAt` | Timestamp UTC da importação |

Chave composta única `(exerciseDefinitionId, locale, revision)`, que também atende à busca por definição e idioma. Não precisa de UUID extra se nenhuma entidade referenciar individualmente a tradução. Importar apenas traduções revisadas; rascunhos não ficam disponíveis ao leitor do produto. Revisões são imutáveis; mesma chave com hash diferente causa conflito, nunca sobrescrita silenciosa.

Leitura: buscar todas as traduções necessárias à página em lote; selecionar maior revisão aprovada para o locale solicitado e hash correspondente à fonte. Fallback por documento completo: locale solicitado → inglês → português → conteúdo legado original. Retornar também `resolvedLocale` para identificar fallback. Evitar misturar instruções portuguesas e inglesas dentro do mesmo bloco. Registros legados sem tradução não impedem acesso ao histórico, mas ficam no relatório de cobertura.

Uma correção editorial pode atualizar o texto exibido para uma definição antiga, sem alterar a execução. Se futuramente for necessário reproduzir exatamente o texto visto pelo usuário, guardar a revisão da tradução no evento correspondente. Essa exigência não está confirmada para o P0.

Preservar `namePt` e `definition` durante a migração como legado. Não renomear a coluna para resolver o problema: há potencial mistura de idiomas. Para português, recuperar `name_pt` do snapshot da definição/importação; para inglês, usar apenas `name_en` comprovado ou tradução revisada. Se a origem não puder ser reconstruída, registrar pendência em vez de rotular automaticamente o valor.

## 6. Fonte versionada e pipeline editorial

Manter Git como fonte editorial e PostgreSQL como projeção de leitura. Criar arquivos de tradução separados, por exemplo `data/translations/exercises/en.json` e `data/translations/exercises/pt-BR.json`, validados por `schemas/exercise-translations.schema.json`.

Cada entrada identifica exercício, versão/hash da fonte, locale, revisão e conteúdo. O importador resolve essa identidade para a definição persistida exata; ausência ou ambiguidade é erro. Se várias definições compartilham exatamente a mesma fonte textual, a tradução pode ser materializada para cada uma após conferir o hash.

Não alterar documentos históricos nem seus checksums para acrescentar traduções. Registrar provenance própria da tradução. Alteração de dose, técnica ou recomendação exige nova versão do conteúdo canônico; não deve ser disfarçada de tradução.

Fluxo editorial: inventariar → traduzir → revisar terminologia e equivalência → validar schema/referências → importar em transação → medir cobertura → publicar. IA pode auxiliar no rascunho, mas não traduzir riscos e instruções automaticamente durante a requisição. Evitar latência, custos recorrentes e mudanças de sentido sem revisão.

## 7. Conteúdo além dos exercícios

Separar três tipos de dados:

- Códigos estáveis, como `completed`, `seconds`, prioridades e categorias: ficam no banco sem tradução; rótulos vêm dos catálogos.
- Textos editoriais de planos, sessões, prescrições, refeições e alimentos: usam traduções associadas à respectiva definição/versionamento. Adicionar tabelas específicas com FKs reais quando houver consumidor; evitar tabela genérica polimórfica sem integridade referencial.
- Texto livre digitado pelo usuário, como anotações e nomes personalizados: permanece no idioma original. Não traduzir nem sobrescrever automaticamente.

Para doses estruturadas, gerar apresentação a partir de dados numéricos: `3 séries de 8 repetições` / `3 sets of 8 reps`. Onde `prescribedText` contiver orientação não representada na dose normalizada, preservar e traduzir esse conteúdo editorial; não tentar reconstruí-lo com suposições.

Antes de prometer versão integral em inglês, inventariar as leituras de nutrição e todos os textos JSON que chegam à interface. Esse mapeamento detalhado permanece uma etapa de implementação; o plano não supõe que só exercícios contenham conteúdo traduzível.

## 8. Datas, números e unidades

Usar Intl/formatadores da biblioteca com locale explícito para apresentação. Manter `America/Sao_Paulo` nas datas civis e UTC nos timestamps conforme arquitetura. Idioma inglês não muda o dia do treino, o fuso ou o início da semana automaticamente.

Manter kg, cm e unidades atuais. Idioma e sistema de medidas são preferências diferentes. Formatar decimais para o usuário, mas persistir números, não strings localizadas. Definir parser de entrada que aceite o separador exibido sem interpretar `12,5` como `125`. Testar datas próximas da meia-noite e formatação consistente entre servidor e cliente.

## 9. Sequência de implementação por arquivo

Os caminhos novos abaixo são propostas; caminhos existentes foram identificados no repositório. A lista cobre integração central; o inventário inicial deverá enumerar cada componente restante antes de distribuir trabalho de tradução.

| Ordem | Ação e caminho | Mudança, dependência e verificação |
|---|---|---|
| 1 | Editar `roadmap/epics/E09-future-evolution/T05-design-i18n-and-english-policy.md` | Reconciliar dois idiomas e detecção com o pedido atual; separar política documental. Rever dependências sem marcar como concluído o spike pendente. |
| 2 | Criar `src/i18n/locale.ts` e `src/i18n/locale.test.ts` | Contrato de locales e negociação pura; verificar variantes, prioridades, entradas inválidas e fallback. |
| 3 | Editar `package.json`, `pnpm-lock.yaml`, `next.config.ts`; criar `src/i18n/request.ts` | Instalar versão compatível e integrar configuração por requisição; validar build e fronteira servidor/cliente. |
| 4 | Criar `messages/en.json`, `messages/pt-BR.json` | Catálogos completos do primeiro fluxo; testar pluralização, interpolação e paridade. |
| 5 | Editar `src/app/layout.tsx` | Locale no HTML, metadata e provider; confirmar primeiro HTML no idioma correto. |
| 6 | Editar `src/components/shared/app-shell/app-shell.tsx` e seu teste | Traduzir navegação e acessibilidade; preservar links existentes. |
| 7 | Editar `src/app/page.tsx`, `src/app/treino/page.tsx`, `src/app/treino/error.tsx`, `src/app/dieta/page.tsx` | Propagar contexto para as telas; verificar estados normais e de erro em ambos os idiomas. |
| 8 | Editar `src/features/training/ui/components/training-day-page/training-day-page.utils.ts` | Separar locale de apresentação do fuso civil; testar data e semana sem mudança de comportamento. |
| 9 | Criar `schemas/exercise-translations.schema.json` e os dois arquivos em `data/translations/exercises/` | Definir contrato e catálogo editorial; validar IDs, hash e cobertura. |
| 10 | Editar `prisma/models/training.prisma`; criar migration aditiva em `prisma/migrations/` | Nova relação/tabela e constraints; Prisma validate e integração PostgreSQL. Nome temporal da migration será gerado ao implementar. |
| 11 | Criar `src/features/plan-definition-import/data/persist-exercise-translations.ts` | Importação transacional, idempotente e com conflitos explícitos; testar repetição e rollback. |
| 12 | Editar `src/features/plan-definition-import/data/persist-plan-definition-snapshot.ts` | Integrar importação depois da resolução das definições; falha de tradução não deixa lote parcialmente importado. |
| 13 | Editar `src/features/plan-definition-import/data/persist-reviewed-exercise-definitions.ts` | Corrigir semântica para novas gravações legadas; preservar existentes e expor vínculo exato das traduções. |
| 14 | Editar `src/features/training/data/prisma-training.mapper.ts` e `prisma-training-repository.ts` | Remover dependência direta de `namePt` na apresentação; leitura em lote e seleção por locale/versionamento. |
| 15 | Editar `src/features/persisted-data-integrity/domain/reviewed-exercise-integrity.rules.ts` | Ajustar invariantes da migração sem reinterpretar snapshots antigos; validar referências e cobertura. |
| 16 | Editar `scripts/validate-data.mjs`; criar `scripts/validate-i18n.mjs` | Verificar fontes editoriais e mensagens separadamente; integrar aos scripts de CI em `package.json`. |

Se o seletor entrar na primeira entrega, criar `src/components/shared/language-selector/language-selector.tsx`, tipos/testes na mesma pasta e `src/app/locale-actions.ts`. A action aceita somente modos permitidos e segue validação de origem existente. O componente usa as primitives de `@fradelli/ui`, sem nova infraestrutura visual.

A arquitetura normativa permanece em [TARGET-ARCHITECTURE.md](../architecture/TARGET-ARCHITECTURE.md). Antes de código/Prisma, ler suas seções de semântica, fronteiras e organização do banco. Não mover a resolução de workspace para o cliente.

## 10. Migração e lançamento

1. Fazer inventário e spike com um Server Component, um Client Component e uma mensagem de erro. Confirmar compatibilidade real da biblioteca.
2. Criar infraestrutura de locale e catálogos; migrar shell e Hoje como primeira fatia completa.
3. Criar tabela aditiva, mantendo campos legados. Aplicar em banco descartável e depois em homologação.
4. Executar preenchimento em lotes, com modo de simulação e relatório: definições encontradas, fontes recuperáveis, traduções válidas e pendências. Não inferir idioma a partir de `namePt`.
5. Importar português e inglês revisados; comparar contagens antes/depois de execuções, IDs, vínculos, doses e resultados.
6. Migrar leituras de treino, depois nutrição e demais superfícies. Consultar traduções em lote e medir número de consultas.
7. Exigir cobertura completa do conteúdo ativo nos dois idiomas antes de anunciar o produto bilíngue. Conteúdo histórico pode ter fallback explicitamente rastreado.
8. Publicar aplicação compatível com os dois formatos. Remoção de campos legados, se desejada, fica para outra migração após auditoria de consumidores.

Rollback: voltar para a versão de aplicação que usa campos legados; preservar tabelas novas e registros importados. Não apagar execuções nem fazer reset de banco. Não executar rollback destrutivo de schema com versões novas ainda em execução. Fazer backup e validar restauração antes da migração em ambiente persistente.

## 11. Testes e critérios de aceite

Testes unitários: negociação; pluralizações zero/um/vários; paridade de parâmetros; fallback; parser decimal; datas civis; códigos de erro estáveis.

Integração PostgreSQL: FKs, unicidade, transação, reimportação idempotente, conflito de revisão/hash, isolamento entre versões do mesmo exercício e preservação de todas as execuções anteriores. Testar fallback quando uma tradução está ausente e rejeição de conteúdo inválido.

Navegador: acesso direto às três rotas em inglês e português; HTML inicial e `lang`; navegação; acessibilidade; erros; calendário; criar e concluir treino; reabrir histórico; eventual troca manual sem perder rascunho; dois visitantes com idiomas diferentes sem contaminação de cache.

Comandos previstos, ainda não executados para implementação: `pnpm db:validate`, `pnpm format:check`, `pnpm lint`, `pnpm structure:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:integration`, `pnpm data:check`, `pnpm data:check:persisted`, `pnpm build` e novo `pnpm i18n:check`. Executar importação e deploy de migration somente nos ambientes definidos para essa etapa.

Entrega aceita quando navegador inglês recebe interface e conteúdo ativo em inglês desde a primeira resposta; navegador português recebe português; idioma não suportado tem fallback definido; nenhuma chave bruta aparece; IDs e registros anteriores continuam iguais; nenhuma regra de treino, dose, unidade ou data muda por causa do idioma; CI impede catálogos incompletos.

## 12. Divisão sugerida das entregas

1. Arquitetura e spike: fechar locale, biblioteca, fallback e contrato editorial.
2. Infraestrutura e shell/Hoje: primeira experiência completa nos dois idiomas.
3. Banco/importador e traduções de exercícios: migração aditiva e leitura localizada.
4. Treino completo: formulários, calendário, execução, histórico e instruções.
5. Nutrição e demais superfícies: inventário detalhado e tradução editorial.
6. Cobertura, regressões, observabilidade e lançamento.

Dependências: 2 e 3 dependem de 1; 4 depende de 2 e 3; 5 depende de 2 e do contrato editorial; 6 depende de todas. Estimativa em horas requer contagem de strings, volume de conteúdo e capacidade de revisão editorial; não foi inventada neste plano.

Pendências: escolher versão efetiva da biblioteca no spike; inventariar todos os consumidores de nutrição; confirmar volume e idioma dos dados realmente persistidos; definir responsável pela revisão das traduções; reconciliar o roadmap anterior, incluindo eventual referência Sandicts, sem bloquear a proposta atual nessa referência ausente.

## Referências consultadas

- [Next.js: internacionalização no App Router](https://nextjs.org/docs/app/guides/internationalization) — negociação a partir das preferências do navegador.
- [next-intl: início](https://next-intl.dev/docs/getting-started) — integração com Next.js.
- [next-intl: exemplos](https://next-intl.dev/examples) — exemplo sem rotas por locale.
- [next-intl: configuração de rotas](https://next-intl.dev/docs/routing/configuration) — escolha entre roteamento por idioma e configuração por preferência.
