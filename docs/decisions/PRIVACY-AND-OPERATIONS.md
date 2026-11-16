# Privacidade e operação do MVP

> Consulta dirigida: acesso atual → [workspace público](PUBLIC-SINGLE-WORKSPACE-MODE.md); recuperação local → [runbook](../operations/BACKUP-AND-RESTORE.md). Pareamento/cookie são desenho histórico adiado. Decisões operacionais não comprovam produção configurada.

## Status

- Data: 2026-09-02
- Decisão: aprovada
- Tarefa: `E03-T03`
- Escopo: acesso pessoal, Vercel, banco, segredos, backup e evolução para contas

> **Substituição parcial em 2026-09-15:** o acesso do P0 passa a seguir
> [Modo público com workspace único](PUBLIC-SINGLE-WORKSPACE-MODE.md). As seções
> de pareamento, cookie e autorização abaixo permanecem como desenho histórico
> adiado, não como requisito ou proteção existente da versão atual.

## Decisão resumida

O Kaizen será publicado em uma URL gerada `*.vercel.app`, sem domínio próprio e sem cadastro ou login convencional no MVP. O shell e as definições de plano já aprovadas podem ser lidos anonimamente. Atribuições diárias, execuções, escolhas e comentários são privados e exigem uma sessão de proprietário instalada uma vez no dispositivo.

Conhecer a URL não concede autorização. Toda leitura de dado operacional e toda mutação verifica a sessão no servidor, junto da camada de acesso aos dados.

## Classificação do acesso

| Recurso                                       | Anônimo    | Dispositivo do proprietário                     |
| --------------------------------------------- | ---------- | ----------------------------------------------- |
| Shell, navegação e explicação do produto      | leitura    | leitura                                         |
| Planos públicos e biblioteca pública          | leitura    | leitura                                         |
| Tipo de dia e treino atribuídos a uma data    | sem acesso | leitura e alteração                             |
| Cumprimento alimentar e descrição alternativa | sem acesso | leitura e alteração                             |
| Séries, cargas, repetições e status de treino | sem acesso | leitura e alteração                             |
| Comentários e histórico operacional           | sem acesso | leitura e alteração                             |
| Definições de plano                           | sem edição | sem edição no MVP                               |
| Operações administrativas e migrations        | sem acesso | fora da interface; somente automação autorizada |

A interface anônima não revela se o proprietário treinou, descansou, comeu ou comentou em determinada data.

## Pareamento do dispositivo

### Experiência

1. O proprietário abre `Ativar modo pessoal`.
2. Informa uma chave de edição longa e aleatória, gerada fora do repositório.
3. O servidor valida a chave sem registrá-la em log.
4. Em sucesso, cria uma sessão de proprietário em cookie protegido.
5. O dispositivo passa a ver e alterar os dados pessoais sem login diário.

Não há usuário, senha, e-mail, recuperação de conta ou cadastro no P0.

### Chave de edição

- Possui pelo menos 32 bytes aleatórios antes da codificação.
- O valor bruto fica somente com o proprietário.
- A Vercel armazena apenas um hash forte da chave em variável sensível.
- Comparações usam tempo constante.
- A chave nunca entra no Git, banco, URL, analytics, corpo de erro ou log.
- Tentativas recebem limite de taxa e resposta genérica.
- Rotacionar o hash e o segredo de sessão invalida o acesso anterior.

### Cookie

- Nome com prefixo `__Host-` em preview e produção.
- `HttpOnly`, `Secure`, `SameSite=Lax` e `Path=/`.
- Conteúdo assinado e autenticado pelo servidor.
- Contém somente identificador de sessão/ator, workspace, papel e expiração; nunca contém a chave de edição.
- Validade máxima de 90 dias, sem duração infinita.
- Expiração, assinatura inválida ou rotação exigem novo pareamento.
- `localStorage` e cookies acessíveis por JavaScript não armazenam autorização.

## Autorização

- A resolução de ator e workspace ocorre em módulo `server-only`.
- A camada de acesso aos dados verifica a sessão antes de retornar registros pessoais.
- Cada Server Action e Route Handler que lê dados privados ou altera estado repete a verificação.
- Ocultar botão no cliente não é controle de segurança.
- O cliente não escolhe `workspace_id`; o servidor deriva o workspace da sessão.
- Mutação também valida `Origin`/`Host`, método, conteúdo, schema de entrada e revisão de concorrência.
- Respostas de erro não diferenciam chave inexistente, expirada ou inválida.
- Dados de outro workspace nunca entram no DTO, mesmo em evolução futura.

Essa abordagem segue a recomendação do Next.js de tratar Server Actions como endpoints públicos, centralizar autorização perto da fonte de dados e configurar cookies de sessão no servidor com `HttpOnly`, `Secure` e `SameSite`.

## Indexação e cache

- Páginas recebem `noindex`, `nofollow` e `noarchive` por metadata e `X-Robots-Tag`.
- O projeto não publica sitemap no MVP.
- O caminho de pareamento não aparece na navegação anônima principal.
- Respostas com dados operacionais usam política privada e não são compartilhadas por CDN.
- Páginas personalizadas por sessão não usam cache público.

Essas medidas reduzem descoberta e cache acidental, mas não são autenticação. A URL e `robots.txt` não protegem dados.

## Hospedagem e ambientes

### Provedores escolhidos

- Aplicação: Vercel.
- Banco gerenciado de preview e produção: Neon PostgreSQL.
- Banco local: PostgreSQL reproduzível em container.
- URL: domínio gerado pela Vercel; nenhum domínio comprado no MVP.

A Vercel gera URLs públicas por padrão para deployments. A proteção nativa padrão pode proteger previews, mas no plano Hobby não torna o domínio de produção privado; por isso a autorização dos dados é responsabilidade da aplicação.

### Matriz

| Ambiente        | Origem Git                              | Aplicação                      | Banco                           | Dados permitidos                                         |
| --------------- | --------------------------------------- | ------------------------------ | ------------------------------- | -------------------------------------------------------- |
| Local           | branch de tarefa baseada em `developer` | processo local                 | PostgreSQL local descartável    | seeds e dados inseridos pelo proprietário localmente     |
| Preview de PR   | branch temporária                       | URL de commit/branch           | branch Neon isolada e expirável | schema + seeds sintéticos; sem logs pessoais de produção |
| Preview estável | `staging`                               | URL de branch estável          | branch Neon `staging`           | dados de homologação separados                           |
| Produção        | `master`                                | URL de produção `*.vercel.app` | branch/projeto Neon de produção | dados pessoais reais                                     |

- `developer` integra código; não é produção nem recebe dados reais automaticamente.
- `staging` usa o ambiente Preview da Vercel, não exige Custom Environment pago.
- `master` é a única production branch.
- Preview nunca recebe `DATABASE_URL` ou chave de produção.
- Branches de preview partem de schema sem dados pessoais ou são sanitizadas antes do uso.
- Toda branch temporária possui expiração e limpeza após a PR.

## Variáveis e segredos

| Nome lógico             | Sensível           | Uso                                               | Escopo                                           |
| ----------------------- | ------------------ | ------------------------------------------------- | ------------------------------------------------ |
| `DATABASE_URL`          | sim                | conexão pooled do runtime                         | local/preview/produção distintos                 |
| `DIRECT_URL`            | sim                | migrations e operações administrativas            | CI por ambiente; não exposta ao cliente          |
| `OWNER_EDIT_TOKEN_HASH` | sim                | validar pareamento pessoal                        | preview estável e produção com valores distintos |
| `SESSION_SECRET`        | sim                | autenticar cookie                                 | valor exclusivo por ambiente                     |
| `PERSONAL_WORKSPACE_ID` | sim por correlação | resolver workspace fixo                           | servidor por ambiente                            |
| `APP_ORIGIN`            | não                | validar origem e gerar links internos necessários | valor próprio por ambiente                       |
| `NEON_API_KEY`          | sim                | criar/limpar branches quando automatizado         | somente CI; ausente no runtime                   |
| credenciais Vercel      | sim                | deploy automatizado                               | somente CI e environments do GitHub              |

Regras:

- nenhum segredo usa prefixo `NEXT_PUBLIC_`;
- arquivo `.env.local` é ignorado e nunca serve como origem de produção;
- variáveis são cadastradas separadamente nos escopos Development, Preview e Production;
- logs mostram somente presença/ausência de configuração, nunca valores;
- rotação de segredo produz novo deploy e evidência no runbook, sem registrar o valor;
- automações recebem permissões mínimas e credenciais próprias por ambiente;
- conexão do runtime não possui privilégios administrativos de migration.

## Segurança de aplicação

- HTTPS obrigatório; HSTS em produção.
- Content Security Policy começa restritiva e libera somente origens necessárias.
- `X-Content-Type-Options: nosniff`, política de referrer restrita e Permissions Policy mínima.
- Entrada textual é validada e renderizada como texto, sem HTML arbitrário.
- Erros públicos usam códigos estáveis e mensagem sanitizada.
- Logs não incluem corpos de requisição, cookies, strings de conexão, comentários ou descrições alimentares.
- Sem analytics, pixels, gravação de sessão ou SDK de terceiros no P0.
- Dependências e headers são verificados no CI antes de promoção.
- Conexões ao banco usam TLS.

## Banco e privilégios

- Produção, staging e previews possuem isolamento de credenciais e dados.
- Runtime usa URL pooled; migration usa conexão direta.
- A role do runtime recebe somente operações necessárias nas tabelas da aplicação.
- Migrations não são executadas a partir do navegador ou de Server Action.
- Banco não é acessado diretamente pelo cliente.
- Dados operacionais possuem `workspace_id` e índices/restrições que incluem o ownership.
- Backups e branches derivados de produção são tratados como dados pessoais; cópia para preview é proibida por padrão.

## Backup e restauração

### Objetivos

- RPO: no máximo 24 horas de registros operacionais perdidos.
- RTO: serviço restaurado ou operando em modo somente leitura em até 4 horas.
- Retenção externa: 14 cópias diárias e 8 cópias semanais.
- Teste de restauração: mensal e antes de release com migration material.

### Camadas

1. Configurar a maior janela de instant restore disponível no plano Neon usado.
2. Criar snapshot antes de migration de produção quando o recurso estiver disponível.
3. Gerar diariamente `pg_dump` em formato custom usando conexão direta e role de backup.
4. Criptografar o dump antes do upload com chave pública cujo segredo de recuperação fica fora do CI.
5. Armazenar o arquivo cifrado fora do Neon e fora do repositório; aplicar a retenção definida.
6. Registrar somente timestamp, tamanho, checksum cifrado e resultado, nunca conteúdo ou credencial.

O destino externo pode ser um artefato privado controlado pelo proprietário, desde que aceite retenção e exclusão automáticas. Um artefato em repositório público só é aceitável se já estiver cifrado de ponta a ponta e não contiver chave privada. A escolha concreta do armazenamento é gate de E08-T03, não pode ficar implícita antes da produção.

### Teste de restore

1. selecionar backup concluído, nunca o arquivo em criação;
2. criar banco/branch isolado sem conexão da produção;
3. aplicar o restore com ferramenta compatível;
4. executar migrations necessárias somente se documentadas;
5. validar schema, lotes de importação, contagens por workspace e referências aos planos;
6. executar smoke tests de Dieta e Treino;
7. registrar duração, ponto recuperado e resultado;
8. destruir o ambiente de teste após a evidência.

Restore não é considerado testado por apenas gerar o dump.

### Incidente

- Interromper mutações antes de restauração de produção.
- Preservar banco afetado para diagnóstico quando possível.
- Preferir criar e validar um ponto restaurado antes de substituir produção.
- Rotacionar segredos potencialmente expostos.
- Reabrir escrita somente após integridade e smoke tests.
- Nunca usar backup de preview para restaurar produção.

## Observabilidade mínima

- Health check confirma versão da aplicação e conectividade mínima sem retornar dados.
- Smoke anônimo confirma apenas conteúdo público.
- Smoke proprietário usa dados descartáveis do workspace de homologação.
- Alertas cobrem falha de deploy, erro persistente de banco, esgotamento de uso e falha de backup.
- Logs estruturados incluem request ID, ambiente, versão e código de erro, sem payload pessoal.
- Não se usa comentário ou descrição do usuário como etiqueta de métrica.

## Evolução para contas

O domínio nasce preparado, mas a complexidade fica adiada:

- todas as tabelas pessoais já pertencem a `workspace_id`;
- aplicação usa um `WorkspaceResolver`, inicialmente fixo e server-only;
- autorização recebe `actor`, `workspace` e capacidade, sem depender de variável global no domínio;
- no futuro entram `User`, `WorkspaceMembership` e sessões de um provedor/biblioteca de autenticação;
- o resolver fixo é substituído por resolver de sessão;
- consultas e constraints continuam usando o mesmo `workspace_id`;
- dados do proprietário são associados a uma membership durante cutover;
- cadastro público só é liberado após política de privacidade, exclusão, exportação, abuso e limites.

Não serão criadas tabelas vazias de usuário ou telas de login no MVP. Preparação significa boundaries e ownership corretos, não funcionalidade prematura.

## Ordem de implementação da proteção

- E05-T05 comprova `pg_dump` e `pg_restore` entre bancos PostgreSQL locais descartáveis; não depende de Neon.
- E05-T06 implementa sessão, pareamento, autorização, origem e limite de tentativas antes das telas operacionais.
- E06 e E07 consomem essa fronteira e não criam segurança ad hoc.
- E08-T01 configura Vercel e Neon somente com dados de homologação separados.
- E08-T02 valida e reforça a proteção já existente sob HTTPS real.
- E08-T03/T04 configuram backup externo e comprovam restore em branch Neon isolada antes da produção.

## Critérios operacionais para E08

- Anônimo lê somente shell e conteúdo público; testes provam ausência de dados operacionais.
- Sessão ausente, inválida, expirada e rotacionada não lê nem altera dados pessoais.
- Todas as mutações verificam autorização no servidor e ignoram `workspace_id` do cliente.
- Local, PR preview, staging e produção usam bancos e segredos distintos.
- Preview de PR não contém dados reais.
- URL de produção gerada funciona sem domínio customizado.
- Headers, cache e metadata de não indexação são verificados por smoke test.
- Backup diário atende RPO, e restore isolado medido atende RTO.
- Rollback de aplicação preserva compatibilidade com migrations já aplicadas.
- Logs e erros são examinados sem encontrar segredos ou payload pessoal.

## Fontes oficiais consultadas

- [Vercel — Generated URLs](https://vercel.com/docs/deployments/generated-urls)
- [Vercel — Environments](https://vercel.com/docs/deployments/environments)
- [Vercel — Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel — Deployment Protection](https://vercel.com/docs/deployment-protection)
- [Next.js — Authentication](https://nextjs.org/docs/app/guides/authentication)
- [Neon — Branching](https://neon.com/docs/guides/branching-intro)
- [Neon — Manage projects and restore window](https://neon.com/docs/manage/projects)
- [Neon — Connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Neon — pg_dump and pg_restore](https://neon.com/docs/import/migrate-from-neon)

Recursos e limites comerciais podem mudar. E08 deve confirmar novamente disponibilidade, retenção e custos antes de configurar os provedores.
