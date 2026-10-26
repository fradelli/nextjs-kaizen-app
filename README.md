# Kaizen

**Organize seu treino, registre o que fez e mantenha o contexto do seu plano.**

O Kaizen é um aplicativo pessoal de treino e alimentação em desenvolvimento.
Hoje, a experiência disponível é a de treino: consultar o dia, ajustar a agenda
e registrar exercícios e práticas esportivas. A alimentação possui planos
versionados, mas sua jornada no aplicativo ainda será implementada.

Foi pensado para quem já possui um plano de treino e quer acompanhar sua rotina
em um único lugar. O estágio atual atende um único espaço de dados compartilhado;
não oferece contas individuais nem acesso privado.

[Recursos disponíveis](#recursos-disponíveis) · [Jornada de uso](#jornada-de-uso) · [Planejamento e limites](#planejamento-e-limites) · [Acesso e privacidade](#acesso-e-privacidade) · [Instalação](#rodar-localmente) · [Documentação](#documentação)

## Recursos disponíveis

| Na rotina                    | O que você pode fazer                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Consultar o dia              | Ver as atividades da data, a preparação e os exercícios do treino.                                                 |
| Organizar a agenda           | Adicionar, editar e remover atividades de ontem até os próximos quatro dias, conforme as regras de cada atividade. |
| Executar o treino            | Registrar séries, cargas, repetições e comentários nos exercícios.                                                 |
| Registrar uma prática depois | Informar futevôlei ou uma atividade externa de hoje ou ontem sem iniciar um cronômetro.                            |
| Guardar o contexto           | Manter o registro associado à data e à versão do plano utilizada.                                                  |

Os registros são persistidos em PostgreSQL. A implementação da jornada de treino
continua em validação; veja as pendências abaixo antes de tratá-la como concluída.

## Jornada de uso

1. **Abra Treino e escolha o dia.** Confira as atividades e expanda uma delas
   para consultar a preparação e os exercícios.
2. **Ajuste a agenda.** Inclua ou edite atividades dentro da janela permitida.
   Planejar uma atividade futura não inicia sua execução.
3. **Realize e registre.** Para o treino com exercícios, informe os resultados
   das séries. Para uma prática externa de hoje ou ontem, use o registro direto.
4. **Consulte o resultado na data correspondente.** Os registros preservam a
   referência do plano utilizado naquele momento.

Por exemplo: você jogou futevôlei ontem e não abriu o aplicativo na hora. Hoje,
pode acessar a data de ontem e registrar a prática, sem inventar horários reais
ou executar um cronômetro retroativamente.

## Planejamento e limites

| Área              | Disponível hoje                                  | Planejado ou pendente                                                                         |
| ----------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Treino            | Agenda, consulta e registro de exercícios.       | Histórico e proveniência na interface, carga alvo por série e consulta da execução anterior.  |
| Horários          | Preenchimento manual do início e fim planejados. | Cálculo automático do fim em análise na E06-T19; implementação aguarda aprovação da política. |
| Práticas externas | Registro retrospectivo implementado.             | Jornada manual completa da E06-T23 ainda pendente.                                            |
| Alimentação       | Planos versionados; página inicial de estrutura. | Consulta da dieta e registro de refeições na E07.                                             |
| Celular           | Navegação inferior implementada.                 | Teclado virtual e área segura aguardam validação em dispositivo real na E06-T14.              |
| Evoluções         | Proposta visual documentada.                     | Adoção visual aguarda aprovação; sono e atividades gerais constam no backlog.                 |

**Limites atuais:** não é possível executar atividades futuras. Os horários
planejados devem ter início e fim no mesmo dia, com fim posterior ao início.
Não há upload de planos pela interface: importação e ativação são operações
locais de manutenção. O dia segue o fuso `America/Sao_Paulo`.

O [roadmap](roadmap/README.md) distingue entregas, validações e planejamento.
A [tarefa selecionada](roadmap/ACTIVE.md) informa a próxima ação; uma proposta
documentada não significa que o recurso já esteja disponível.

## Acesso e privacidade

> **A versão atual funciona sem login.** Quem acessar a URL pode consultar e
> alterar os registros pelas operações disponíveis. Existe um único espaço de
> dados compartilhado, configurado no servidor.

Essa é uma decisão temporária para esta fase pessoal do projeto. Autenticação
é obrigatória antes de atender múltiplos usuários ou armazenar dados sensíveis.
A decisão completa está em [Modo público com workspace único](docs/decisions/PUBLIC-SINGLE-WORKSPACE-MODE.md).

O código e os planos aprovados são versionados neste repositório público.
Credenciais, configurações locais, backups e registros do banco não devem ser
commitados. Os planos documentam o uso pessoal e não substituem orientação
profissional de treino ou alimentação.

## Rodar localmente

O desenvolvimento usa **Node.js 24.20.0**, **pnpm 11.25.0** e **PostgreSQL 18.6**.
O banco local pode ser iniciado com Docker Compose.

<details>
<summary><strong>Primeira configuração do ambiente</strong></summary>

### 1. Preparar dependências e configuração

Na raiz do repositório, habilite o gerenciador e instale as dependências:

```powershell
corepack enable
pnpm install --frozen-lockfile
```

O pacote visual `@fradelli/ui` vem do GitHub Packages. A instalação depende de
acesso de leitura a esse registry; mantenha credenciais fora do repositório.

Configure o acesso ao GitHub Packages no ambiente ou na configuração privada do
gerenciador, conforme o registry de [.npmrc](.npmrc); nunca versione tokens.

Se ainda não houver um `.env`, copie o exemplo sem sobrescrever uma configuração existente:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Preencha as senhas locais distintas de desenvolvimento, teste e recuperação e as
URLs conforme [.env.example](.env.example). O Compose referencia as três senhas
mesmo ao iniciar somente o serviço de desenvolvimento. As URLs de teste devem
apontar exclusivamente para um banco de teste separado. Mantenha `APP_ENV=local`
e o workspace fixo configurado no servidor.

### 2. Preparar o banco local

Com o Docker em execução e as variáveis configuradas:

```powershell
docker compose up -d --wait database
pnpm db:generate
pnpm db:deploy
pnpm workspace:ensure
```

Use um banco de desenvolvimento. `db:deploy` aplica as migrations versionadas;
`workspace:ensure` prepara o espaço único de dados usado pela aplicação.

### 3. Importar os planos e abrir o aplicativo

Em um banco local novo, importe as definições versionadas:

```powershell
pnpm data:import --environment local
pnpm dev
```

A importação usa, por padrão, os arquivos do commit `HEAD`, e não alterações
pendentes. Confira o resultado do importador; detalhes de importação e ativação
estão no [guia de persistência](docs/implementation/E05.md).

Abra [Treino no ambiente local](http://localhost:3000/treino).

</details>

<details>
<summary><strong>Ambiente já preparado e acesso pelo celular</strong></summary>

Para iniciar novamente:

```powershell
pnpm dev
```

Para testar em um celular na mesma rede, pare o servidor e substitua `IP_LOCAL`
pelo endereço da máquina de desenvolvimento:

```powershell
pnpm db:generate
pnpm workspace:ensure
pnpm exec next dev --hostname IP_LOCAL
```

No celular, abra `http://IP_LOCAL:3000/treino`, usando o mesmo endereço do comando.
O acesso pela rede também segue o modo sem login descrito acima.

</details>

## Para quem desenvolve

A aplicação usa Next.js com React e TypeScript. Os planos ficam em JSON
versionado; atribuições e execuções ficam em PostgreSQL, com Prisma. A interface
consome o Fradelli Design System.

| Comando                 | Finalidade                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`              | Iniciar o ambiente de desenvolvimento.                                                                             |
| `pnpm data:check`       | Conferir os dados versionados, seus IDs e referências.                                                             |
| `pnpm test`             | Executar os testes unitários.                                                                                      |
| `pnpm test:integration` | Executar os testes que dependem do banco de teste configurado.                                                     |
| `pnpm run ci`           | Executar os gates locais de qualidade, testes, dados, build e auditoria; exige os ambientes de teste configurados. |

<details>
<summary><strong>Validações específicas e banco de teste</strong></summary>

| Comando                                  | O que verifica                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| `pnpm format:check`                      | Formatação de código e configuração.                                    |
| `pnpm lint`                              | Regras de qualidade do código.                                          |
| `pnpm structure:check`                   | Organização de componentes e fronteiras entre camadas.                  |
| `pnpm typecheck`                         | Tipos TypeScript, após gerar o cliente Prisma.                          |
| `pnpm test:ci-scripts`                   | Regressões dos validadores de CI.                                       |
| `pnpm build`                             | Compilação da aplicação para produção.                                  |
| `pnpm governance arquivo-do-evento.json` | Direção, título, descrição e tarefa da PR a partir do evento informado. |
| `git diff --check`                       | Erros de espaços e conflitos no diff.                                   |

Para as integrações, configure as URLs de teste e inicie o serviço separado:

```powershell
docker compose --profile test up -d --wait database-test
pnpm test:integration
```

Os testes usam e limpam seu banco exclusivo; nunca aponte as URLs de teste para o
banco de desenvolvimento ou produção.

O script de formato não abrange a documentação humana. Para conferir este README:

```powershell
pnpm exec prettier --check README.md
```

Na reauditoria de 26/10/2026, os comandos foram conferidos nos scripts e nas
configurações. A instalação limpa e a CI completa não foram executadas: o Corepack
não conseguiu resolver `registry.npmjs.org`. As verificações locais realizadas
estão no [diário operacional](docs/worklog/index.md).

</details>

Os scripts completos estão em [package.json](package.json). `pnpm run ci` é o
comando de validação do projeto; `pnpm ci` é reservado à instalação congelada.

<details>
<summary><strong>Organização do repositório e fluxo de entrega</strong></summary>

| Caminho               | O que você encontra                                                    |
| --------------------- | ---------------------------------------------------------------------- |
| `src/`                | Aplicação e regras de negócio.                                         |
| `data/` e `schemas/`  | Planos versionados e contratos de validação.                           |
| `prisma/`             | Modelo do banco e migrations.                                          |
| `scripts/` e `tests/` | Operação, verificações e cenários de teste.                            |
| `docs/`               | Produto, arquitetura, decisões e guias.                                |
| `roadmap/`            | Tarefas, dependências e estado das entregas.                           |
| `templates/`          | Modelos de entrada usados pelos guias de atualização dos planos.       |
| `vendor/braces/`      | Código versionado de uma correção de dependência; deve ser preservado. |

`node_modules/` contém dependências instaladas; `src/generated/prisma/` guarda o
cliente gerado do banco. `.next/`, `coverage/` e
`*.tsbuildinfo` são gerados e podem ser recriados. O `.env` contém a configuração
local e deve permanecer fora do Git.

Cópias de trabalho do Git são auxiliares. Antes de removê-las, preserve qualquer
alteração local em um commit ou backup recuperável.

O fluxo de entrega é `branch de tarefa → developer → staging → master`.
Tarefas entram em `developer` por squash; promoções usam merge commit.
As convenções completas estão em [AGENTS.md](AGENTS.md).

</details>

## Documentação

| Quero entender…                           | Onde consultar                                                                         |
| ----------------------------------------- | -------------------------------------------------------------------------------------- |
| Qual é a próxima pendência                | [Tarefa selecionada](roadmap/ACTIVE.md)                                                |
| O que foi entregue e o que está planejado | [Roadmap](roadmap/README.md)                                                           |
| Como o produto deve funcionar             | [Escopo e jornadas do P0](docs/product/P0.md)                                          |
| Como a aplicação é organizada             | [Arquitetura alvo](docs/architecture/TARGET-ARCHITECTURE.md)                           |
| Como os dados públicos são tratados       | [Política do repositório público](docs/decisions/PUBLIC-REPOSITORY-AND-DATA-POLICY.md) |
| Quais planos estão selecionados           | [Treino](data/active.json) e [alimentação](data/nutrition/active.json)                 |
| Quais verificações foram realizadas       | [Diário operacional](docs/worklog/index.md)                                            |
| Como atualizar planos                     | [Guia de atualização dos dados de treino](docs/guides/UPDATING-TRAINING-DATA.md)       |
| Como a aparência pode evoluir             | [Proposta visual](docs/implementation/FRADELLI-DESIGN-SYSTEM-ADOPTION-PLAN.md)         |

O [contexto consolidado](kaizen-project-context.md) preserva uma análise histórica;
confirme informações de implementação no código e no roadmap atual.
