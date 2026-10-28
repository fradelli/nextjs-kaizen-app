---
id: E06-T25
epic: E06
depends_on: [E06-T24]
---

# Modais de inclusão e edição de atividades com rascunho local

## Objetivo

O botão + abre somente o formulário de inclusão; o lápis no card abre somente a
edição daquela atividade. Manter os campos condicionais existentes e ações no rodapé,
com recuperação de preenchimento local independente dos rascunhos de execução.

## Entrada principal

`docs/implementation/TRAINING-ACTIVITY-MODALS-AND-DRAFTS-IMPLEMENTATION-GUIDE.md`.

## Decisões e integração

- Dialog nativo com foco, Esc/backdrop controlados e rodapé fora dos formulários.
- Cache validado, inclusão por data e edição por ID, debounce 400ms e retenção 7 dias.
- Conflito de base/plano/outra aba impede substituição silenciosa e mantém os valores.
- Durante salvar/excluir, bloquear fechamento e operação duplicada. Erro conserva dados.
- Aquecimento, horários, sessão histórica e limites de remarcação preservam a E06-T24.
- Sem alteração de migrations, plano canônico ou dependências.
- Ajuste constatado no Chrome: retorno saved deve limpar/navegar na continuação da
  Server Action, antes de o refresh remover o card da origem. O hook de feedback
  ganhou refreshOnSaved opcional; editor/exclusão coordenam seu refresh único.

## Critérios de aceite

- [x] + abre só inclusão e lápis abre só o treino escolhido.
- [x] Campos atuais mantidos; ações externas ao corpo/form; sem forms aninhados.
- [x] Rascunhos recuperados e descartados de forma segura; conflitos não sobrescrevem.
- [x] Envio, fechamento, exclusão e falhas com proteção de dados e foco.
- [x] Datas, aquecimento e execução mantêm regras existentes.
- [x] Qualidade, testes, build e roteiro de navegador aprovados.

## Validação

Concluída em 27/10/2026:

- 377 testes de aplicação em 52 arquivos; cobertura de linhas 90,76% e branches 84,69%.
- 50 testes PostgreSQL em sete arquivos e 33 testes dos scripts aprovados.
- Formatação, lint, estrutura, tipos, integridade de dados, build e governança aprovados.
- Auditoria sem vulnerabilidades conhecidas.
- Chrome com banco descartável: inclusão exclusiva, recuperação, rodapé externo,
  sugestão por esporte, edição e remarcação com mesmo ID/horários/aquecimento,
  origem sem recriação, Sem aquecimento preservado, exclusão cancelada/confirmada.
- Foco/Escape/Tab e rodapé em viewport 320px com fonte ampliada validados no navegador.
- Artefatos locais de verificação em .git: activity-editor-browser-result.log,
  activity-editor-add-mobile.png, activity-editor-edit-mobile.png e
  activity-editor-small-mobile.png. Não constituem testes de aparelho físico.
- Ajuste adicional: transition no gatilho aguarda o DTO atualizado antes de reabrir;
  referência explícita ao gatilho e ciclo de Tab garantem retorno/contenção de foco.
- A resposta saved é tratada antes de desmontar o card; regressão automatizada cobre
  a remoção da origem pelo servidor antes de atualizar a interface.

Nenhum dado operacional pessoal foi usado nos testes.
Teclado virtual e safe area em aparelho físico permanecem no escopo de E06-T14.
