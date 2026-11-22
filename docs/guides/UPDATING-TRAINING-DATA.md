# Como atualizar os dados de treino

- **Tipo:** Guia.
- **Área:** Treino.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

Este guia descreve o fluxo operacional do Kaizen. Os dados canônicos prevalecem sobre exemplos de texto ou pedidos sugeridos.

## Fronteira de privacidade

- O repositório é público.
- Templates vazios podem ser versionados; cópias preenchidas permanecem privadas.
- Agenda exata, check-ins preenchidos, contexto de saúde e originais do coach não entram no Git.
- Até existir banco protegido, esses dados permanecem em fonte privada com proveniência registrada no [manifesto](../migration/MIGRATION-MANIFEST.md).

## Novo treino do coach

1. Copie o [template privado de entrada](../../templates/NOVO-TREINO-DO-COACH.md) para fora do repositório.
2. Preserve nomes, ordem, dose e observações exatamente como recebidos.
3. Registre a origem privada, o hash e `DO_NOT_PUBLISH` no manifesto.
4. Produza uma revisão separada, classificando relevância, redundância, dosagem e substituições.
5. Remova da revisão pública qualquer dado pessoal ou trecho de terceiro desnecessário.
6. Crie uma nova versão em `data/plans/` quando a prescrição mudar.
7. Atualize `data/active.json`, os guias derivados e `CHANGELOG.md`.

Exemplo operacional, não canônico:

> Leia as regras do repositório e os dados ativos. Preserve a entrada anexada em fonte privada, revise cada exercício e proponha somente mudanças justificadas. Crie uma nova versão do plano sem alterar histórico e publique apenas derivados autorizados no manifesto.

## Mudança de agenda

1. Preencha uma cópia privada de [MUDANCA-DE-HORARIOS.md](../../templates/MUDANCA-DE-HORARIOS.md).
2. Atualize os fatos completos somente no armazenamento privado.
3. No repositório público, mantenha dias e horários nulos e publique apenas regras agregadas aprovadas.
4. Reorganize força, potência, superiores, mobilidade e descanso sem trocar exercícios sem necessidade.
5. Crie nova versão do plano se a distribuição mudar materialmente.

## Check-in semanal

1. Preencha uma cópia privada de [CHECK-IN-SEMANAL.md](../../templates/CHECK-IN-SEMANAL.md).
2. Procure tendências em mais de uma sessão; um dia ruim isolado não exige mudança automática.
3. Diante de sinal de alerta, priorize segurança e avaliação profissional.
4. Versione somente mudanças de regras ou plano, nunca a resposta pessoal preenchida.

Exemplo operacional, não canônico:

> Compare o check-in privado com o plano ativo. Separe fatos, tendências e incertezas; sugira os menores ajustes necessários e não publique os dados brutos do check-in.

## Antes de concluir

- Validar JSONs, ponteiro ativo e IDs de exercícios.
- Registrar hashes e transformações no manifesto.
- Atualizar documentação derivada e changelog.
- Verificar links relativos e ausência de dados privados.
- Preservar versões e originais em vez de sobrescrevê-los.
