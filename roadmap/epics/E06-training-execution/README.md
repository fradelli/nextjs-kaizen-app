# E06 — Execução de treino

## Resultado esperado

Treino, preparação, mobilidade ou descanso do dia consultáveis e registráveis no workspace fixo, preservando plano e histórico.

## Ordem

| Tarefa  | Depende de | Resultado                                                |
| ------- | ---------- | -------------------------------------------------------- |
| E06-T01 | E05-T05    | Projeção do plano e da execução do workspace fixo        |
| E06-T02 | E06-T01    | Página de treino do dia                                  |
| E06-T03 | E06-T02    | Preparação, séries e comentários                         |
| E06-T04 | E06-T03    | Proveniência e histórico                                 |
| E06-T05 | E06-T04    | Fluxo validado                                           |
| E06-T06 | E06-T03    | Carga alvo por exercício ou por série                    |
| E06-T07 | E06-T03    | Última execução por série como referência                |
| E06-T08 | E06-T03    | Avanço condicionado às medidas aplicáveis                |
| E06-T09 | E06-T03    | UX do contador de descanso aprovada                      |
| E06-T10 | E06-T09    | Contador de descanso não modal                           |
| E06-T11 | E06-T03    | Ciclo de vida do plano diário decidido                   |
| E06-T12 | E06-T11    | Edição diária refinada conforme lacunas                  |
| E06-T13 | E06-T11    | Futuro reconciliado após troca de plano                  |
| E06-T14 | E04-T04    | Navegação principal inferior no mobile                   |
| E06-T15 | E06-T11    | Programação semanal sem esporte fixo                     |
| E06-T16 | E06-T15    | Novo plano e aquecimentos validados                      |
| E06-T17 | E06-T11    | Reinício operacional controlado e recuperável            |
| E06-T18 | E06-T16    | Condução guiada dos blocos combinados                    |
| E06-T19 | E06-T12    | Fim planejado calculado pela duração da sessão           |
| E06-T20 | E06-T12    | Inclusão sem a opção Treino específico                   |
| E06-T21 | E06-T16    | Contrato de importação externa projetado                 |
| E06-T22 | E06-T12    | Agenda futura editável sem execução antecipada           |
| E06-T23 | E06-T12    | Registro retrospectivo de atividades externas em revisão |

As tarefas E06-T06 a E06-T22 são uma rodada complementar. Nenhuma
começa automaticamente nem amplia o gate de E06-T05 sem nova priorização. Ao
selecionar qualquer uma, reanalisar a base já integrada, apresentar solução e
plano e aguardar aprovação antes de implementar.

## Prioridade para começar a usar a nova programação

Prioridade confirmada em 26/10/2026: **E06-T19**, seguida da **E06-T20**, antes
de avançar à página de Dieta. A E06-T22 já foi concluída. Reanalisar e aprovar
cada plano antes da implementação. A validação retrospectiva da E06-T23 e a
validação em dispositivo real da E06-T14 continuam pendentes.

1. E06-T11 decide as regras do dia antes de ampliar a agenda.
2. Após a revisão das alterações do roadmap pelo usuário, E06-T17 só reinicia
   dados após escolha do ambiente, escopo, backup e autorização específica.
   O reinício local autorizado foi concluído com backup restaurável.
3. E06-T15 generaliza a semana; após receber o novo treino, E06-T16 o importa,
   sessões reserva ficam fora da versão atual até aprovação específica.
4. E06-T06 e E06-T08 podem ser avaliadas em conjunto; E06-T07 entra antes de
   comparar execuções posteriores. E06-T09 precede E06-T10. E06-T14 pode ser
   entregue separadamente. E06-T12 depende das lacunas identificadas em T11.
5. E06-T13 pode ser reavaliada caso o reinício controlado elimine a necessidade
   imediata de reconciliar atividades futuras antigas; não está cancelada.
6. E06-T21 começa após a importação manual validada da nova programação. Primeiro
   estabiliza o contrato JSON e a prévia; Excel reutiliza esse contrato em etapa
   posterior, sem criar outro caminho de persistência.

O novo plano contém blocos combinados: E06-T16 preserva sua estrutura e apresenta
subtítulos A/B com navegação manual. O fluxo guiado permanece adiado em E06-T18,
com nova revisão antes de implementar. E06-T04 e E06-T05 continuam necessários para encerrar o épico.

## Fora de escopo

- Edição livre dos planos canônicos pelo aplicativo antes da E06-T21.
- Recomendação automática baseada em dor, fadiga ou diagnóstico.

## Critérios de encerramento

- [ ] O usuário encontra o treino correto para o dia.
- [ ] Carga aparece somente quando aplicável e séries podem ser salvas parcialmente.
- [ ] Mobilidade e descanso não criam exercícios artificiais.
- [ ] Dados ausentes são apresentados sem inferências.
- [ ] Origem e versão do plano são rastreáveis.
