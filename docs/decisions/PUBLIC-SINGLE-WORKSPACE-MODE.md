# Modo público com workspace único

- **Tipo:** Decisão.
- **Área:** Acesso.
- **Tarefas relacionadas:** [E05-T06](../../roadmap/epics/E05-database-and-import/T06-implement-personal-access.md), [E06-T01](../../roadmap/epics/E06-training-execution/T01-project-active-training-plan.md), [E07-T01](../../roadmap/epics/E07-nutrition-execution/T01-project-active-nutrition-plan.md), [E05-T05](../../roadmap/epics/E05-database-and-import/T05-validate-backup-and-restore.md), [E08-T02](../../roadmap/epics/E08-personal-release/T02-protect-access.md).

## Status

- Data: 2026-09-15
- Decisão: aprovada
- Tarefa: `E05-T06`
- Escopo: acesso ao P0 antes da adoção de contas e autenticação

## Contexto

O proprietário quer usar o Kaizen em uma URL pública antes de disponibilizá-lo
para outras pessoas. Nesta fase, somente ele conhece a URL e considera os dados
que registrará como não sensíveis. Ele aceita explicitamente o risco de uma
terceira pessoa que descubra a URL ler ou alterar esses registros.

URL difícil de descobrir, `robots.txt`, metadata de não indexação e headers não
são autenticação. Esta decisão não descreve os dados como privados nem promete
controle de acesso inexistente.

## Decisão

O P0 opera temporariamente sem login, pareamento, cookie de sessão ou autorização
por usuário. Leitura e mutação das jornadas de Treino e Dieta ficam públicas e
atuam em um único workspace configurado no servidor.

- `PERSONAL_WORKSPACE_ID` é lido somente em módulo `server-only`.
- O navegador nunca envia nem escolhe o `workspace_id` efetivo.
- Repositórios filtram toda leitura e escrita operacional pelo workspace
  resolvido no servidor.
- Server Actions continuam sendo endpoints públicos: validam origem, schema de
  entrada, invariantes e revisão de concorrência.
- Não haverá interface administrativa, importação destrutiva ou migration
  disparada pelo navegador.
- Conteúdo-fonte marcado `DO_NOT_PUBLISH`, credenciais, backups e dados de outros
  ambientes permanecem fora da aplicação pública.

Essas medidas preservam isolamento estrutural e integridade, mas não impedem
uma pessoa que acesse a URL de usar as mesmas leituras e mutações disponíveis ao
proprietário.

## Preparação para autenticação futura

As tabelas operacionais continuam pertencendo a `workspace_id`. Os casos de uso
recebem um contexto de workspace e não conhecem cookie, provedor ou variável de
ambiente. Hoje esse contexto vem do resolvedor fixo; no futuro ele será fornecido
por uma sessão autenticada e por uma membership, sem trocar as regras de Treino
e Dieta nem confiar em ownership recebido do cliente.

Autenticação real é gate obrigatório antes de qualquer uma destas mudanças:

- liberar cadastro ou acesso para outras pessoas;
- armazenar dados que o proprietário passe a considerar sensíveis;
- prometer privacidade ou isolamento entre usuários;
- criar múltiplos workspaces ou colaboração;
- oferecer operações administrativas pela interface.

O cutover futuro deve incluir `User`, `WorkspaceMembership`, sessão, autorização,
proteção contra abuso, exportação/exclusão e política de privacidade. A antiga
proposta de pareamento pode ser reavaliada, mas não é implementada agora.

## Consequências

- `E05-T06` é cancelada no escopo de pareamento e autenticação.
- `E06-T01` e `E07-T01` dependem da fundação persistente concluída em `E05-T05`
  e consomem o resolvedor fixo existente.
- O hardening de `E08-T02` comprova a exposição pública aceita, o isolamento do
  workspace fixo, a validação de origem/entrada, cache, headers e logs; não pode
  alegar que os registros estão protegidos por autenticação.
- A adoção de autenticação futura deve virar tarefa própria antes da abertura do
  produto a outros usuários.
