# E09 — Evolução futura

## Resultado esperado

Backlog posterior ao MVP mantido separado do caminho crítico atual.

## Antecipação aprovada em 29/10/2026

O usuário autorizou antecipar [E09-T09](T09-localize-current-interface.md), limitada à interface atual em português e inglês com detecção automática. O catálogo novo será integrado separadamente. Espanhol e a política English-first ampla permanecem no backlog. Essa autorização substitui a restrição temporal abaixo somente para E09-T09.

## Regra de criação

As tarefas permanecem `PLANNED` até a validação do MVP pessoal. Antes de uma
tarefa ficar `READY`, seu planejamento deve confirmar problema, dados necessários,
privacidade, contratos, riscos, entradas exatas e critério de sucesso.

## Sequência aprovada

| Tarefa  | Depende de                  | Resultado                                                     |
| ------- | --------------------------- | ------------------------------------------------------------- |
| E09-T01 | E08-T05                     | Escopo de sono e atividades gerais projetado                  |
| E09-T02 | E09-T01                     | Controle de sono utilizável                                   |
| E09-T03 | E09-T01                     | Registro de atividades gerais utilizável                      |
| E09-T04 | E09-T02, E09-T03            | Jornadas de sono e atividades validadas                       |
| E09-T05 | E06-T05, E07-T05, E09-T04   | Arquitetura i18n e política English-first aprovadas            |
| E09-T06 | E09-T05                     | Produto e conteúdo canônico internacionalizados               |
| E09-T07 | E09-T05                     | Documentação e fluxo de entrega migrados para inglês          |
| E09-T08 | E09-T06, E09-T07            | Experiência multilíngue e fallback validados                  |

Sono e atividades gerais entram antes do i18n para que as quatro jornadas do
produto — treino, alimentação, sono e atividades — compartilhem o mesmo contrato
de localização desde a migração, sem criar uma segunda rodada imediata.

## Candidatos ainda sem compromisso de escopo

- Métricas, tendências e histórico interativo.
- Rotina, hábitos, tarefas, agenda composta, notificações e integrações; domínio e calendário permanecem no Kaizen.
- Edição assistida, administração e múltiplos usuários.

## Fora de escopo agora

Idiomas iniciais de i18n confirmados em 26/09: português, espanhol e inglês.
A arquitetura e a implementação amplas continuam futuras; a interface atual foi antecipada pela E09-T09.

- Implementar qualquer tarefa antes do encerramento de E08.
- Iniciar i18n antes da validação de treino, alimentação, sono e atividades gerais.
- Reescrever histórico Git, migrations aplicadas ou IDs estáveis durante a tradução.

## Critérios de entrada

- [ ] MVP pessoal validado em uso real.
- [ ] Próximo problema priorizado com evidência.
- [ ] Impacto sobre privacidade e modelo de dados revisado.
