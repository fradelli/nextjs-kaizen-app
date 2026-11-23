---
id: E06-T02
epic: E06
depends_on: [E04-T04, E06-T01]
---

# Criar página de treino do dia

## Objetivo

Exibir treino, mobilidade, descanso ou estado não atribuído da data com leitura rápida em celular.

## Entradas

- `docs/history/implementation/E06.md`
- `docs/product/P0.md`
- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/features/training/application/training-dto.ts`
- `src/features/training/domain/training-day.rules.ts`
- `src/features/training/domain/training-projection.error.ts`
- `src/features/training/data/training-queries.ts`
- `src/app/treino/page.tsx`
- `src/components/shared/feature-placeholder/feature-placeholder.tsx`

## Entregáveis

- Página server-rendered do dia com navegação por data e URL canônica.
- Estados explícitos para treino, mobilidade, descanso, não atribuído,
  indisponível, data inválida, referência inconsistente e erro inesperado.
- Componentes acessíveis e responsivos, organizados em pastas próprias.

## Decisões de implementação

- E06-T02 é somente leitura. Atribuir sessão, mobilidade ou descanso, salvar
  execução e concluir treino pertencem à E06-T03.
- A data ausente redireciona para `?date=YYYY-MM-DD` calculada no servidor em
  `America/Sao_Paulo`; data inválida não consulta o banco.
- Navegação anterior/Hoje/seguinte usa datas civis e não depende do fuso do
  navegador.
- `src/app/treino/page.tsx` permanece fino: resolve a rota, inicia a query
  server-only e entrega somente contratos serializáveis à UI.
- Server Components são o padrão. O único limite Client obrigatório é o error
  boundary com nova tentativa.
- O conteúdo assíncrono usa `Suspense` local para preservar cabeçalho e data sem
  apresentar o treino anterior como se pertencesse à nova data.
- Erros de referência conhecidos viram feedback seguro; detalhes de banco,
  caminhos e IDs internos não chegam ao navegador.
- Valores `null` permanecem ausentes. Carga aparece somente quando
  `loadApplicable` for verdadeiro e não aplicável nunca vira `0 kg`.
- Cada componente React fica em pasta própria; auxiliares permanecem junto de
  seu consumidor real e nenhum barrel global é criado.

## Plano por responsabilidade

### Data civil e rota

- Criar resolvedor puro e testado para hoje em `America/Sao_Paulo`, validação da
  query e cálculo de anterior/seguinte atravessando mês, ano e ano bissexto.
- Normalizar `/treino` para a URL canônica e oferecer retorno para Hoje em caso
  de parâmetro inválido ou repetido.

### Composição server-only

- Reutilizar `queryFixedWorkspaceTrainingDay()` e mapear apenas falhas conhecidas
  para um resultado serializável da página; falhas inesperadas seguem para o
  error boundary.
- Não aceitar `workspace_id`, não criar cache público e não introduzir endpoint
  HTTP interno.

### Interface

- Criar `src/features/training/ui/components/training-day-page/` com o frame da
  página e filhos privados para navegação, loading, feedback, dia não atribuído,
  descanso, sessão, exercício e série.
- Exibir preparação antes do treino principal; mobilidade usa apenas sua sessão
  e descanso não cria exercícios artificiais.
- Traduzir estados e medidas para textos legíveis, preservar a ordem do DTO e
  exibir instruções, alertas e comentários como texto simples.
- Usar primitives do `@fradelli/ui` e composição local sem duplicar tokens do
  Design System.

### Testes

- Cobrir data ausente, inválida e repetida, mudanças de mês/ano e ano bissexto.
- Cobrir todos os estados discriminados, preparação separada, carga aplicável,
  valores ausentes, ordenação e rótulos acessíveis.
- Confirmar ausência de formulário, mutação e ownership vindo do navegador.

## Subtarefas

- [x] Implementar data anterior, Hoje e data seguinte em `America/Sao_Paulo`.
- [x] Exibir as opções disponíveis quando o dia não estiver atribuído, sem gravar.
- [x] Separar conteúdo público dos dados pessoais.
- [x] Tratar loading, vazio, referência inválida e erro.
- [x] Exibir treino, preparação, mobilidade e descanso sem inventar dados.
- [x] Manter o menor limite Client e componentes em pastas próprias.

## Validações

- Testar navegação, responsividade, estados discriminados e falhas seguras.
- Executar formato, lint, estrutura, tipos, testes, integração PostgreSQL,
  cobertura, build, auditoria, `pnpm run ci` e `git diff --check`.

## Critérios de aceite

- [x] O usuário identifica o estado do dia sem inferência de agenda privada.
- [x] Data e navegação permanecem visíveis durante carregamento e falhas.
- [x] Preparação e treino principal aparecem separados e na ordem prescrita.
- [x] A página não aceita workspace nem oferece controles de gravação.

## Fora de escopo

- Atribuir treino, mobilidade ou descanso.
- Salvar preparação, séries, comentários ou conclusão.
- Autenticação, múltiplos usuários, cache público ou infraestrutura de produção.

## Resultado

Página de treino do dia implementada como leitura server-rendered, com URL
canônica por data civil de `America/Sao_Paulo`, navegação entre datas e estados
explícitos para treino, mobilidade, descanso, dia não atribuído, indisponibilidade,
data inválida, referência inconsistente e erro inesperado. A composição preserva
o workspace fixo exclusivamente no servidor, não oferece mutações e mantém apenas
o error boundary como limite Client. Componentes, testes e estilos permanecem
organizados por responsabilidade; a validação final aprovou 196 testes unitários,
33 integrações PostgreSQL, cobertura, validadores, build e auditoria sem
vulnerabilidades conhecidas.
