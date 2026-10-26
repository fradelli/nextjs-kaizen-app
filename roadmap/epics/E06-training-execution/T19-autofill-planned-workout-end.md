---
id: E06-T19
epic: E06
depends_on: [E06-T12]
---

# Preencher automaticamente o fim planejado do treino

## Objetivo

Ao adicionar um treino do plano, calcular o fim planejado a partir do início
informado e da duração da sessão selecionada, sem exigir cálculo manual.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.tsx`
- `src/features/training/application/training-dto.ts`
- `src/features/training/data/prisma-training-repository.ts`
- `src/app/treino/training-actions.ts`

## Regras confirmadas

- Usar a duração da sessão carregada do plano, nunca um valor fixo na interface.
- Calcular após selecionar a sessão e informar o início, independentemente da ordem.
- A duração atual já inclui aquecimento; não somá-lo novamente.
- Exemplo: início 18h e duração de 40 minutos resultam em fim às 18h40.
- Não iniciar cronômetro nem persistir a atividade somente por preencher o campo.

## Decisões antes da implementação

- Reanalisar e apresentar o plano ao usuário antes de implementar.
- Decidir se o fim continua editável e como preservar uma alteração manual ao trocar início ou sessão.
- Definir o feedback para duração ausente ou término no dia seguinte, respeitando o contrato de horários vigente.
- Confirmar aplicação na edição de atividades existentes, além da inclusão.

## Critérios de aceite

- [ ] Fim automático usa a duração real da sessão e não duplica o aquecimento.
- [ ] Mudança de início ou sessão segue a política aprovada sem sobrescrever silenciosamente alterações manuais.
- [ ] Entrada em qualquer ordem e duração ausente possuem testes.
- [ ] Validação no servidor, janela de edição e ownership permanecem preservados.

## Diagnóstico e proposta — 26/10/2026

### Fatos confirmados

- O formulário recebe `targetDurationMinutes` da sessão pública, mas os campos
  de início, fim e sessão usam valores iniciais sem cálculo ou sincronização.
- O mesmo formulário atende inclusão e edição; o ajuste deve considerar ambas.
- O servidor exige horários no mesmo dia e fim posterior ao início. Virar o dia
  não é representável pelo contrato atual.

### Política proposta para aprovação

- Calcular início + duração da sessão em Treino do plano, independentemente da
  ordem de preenchimento; não adicionar novamente o aquecimento.
- Manter o fim editável. Enquanto automático, recalcular ao mudar início ou
  sessão. Depois de uma alteração manual, preservar o valor e oferecer uma
  ação explícita para retomar o cálculo automático.
- Na edição, preservar o horário existente e começar em modo manual, sem alterar
  silenciosamente a agenda salva. O usuário pode ativar o cálculo automático.
- Duração ausente/inválida: não inventar duração; orientar preenchimento manual.
- Término no dia seguinte: não aplicar módulo de 24 horas; explicar a limitação
  e solicitar horário compatível com o contrato do mesmo dia.
- Não salvar ou iniciar execução ao preencher; manter as validações do servidor.

### Plano de implementação proposto

1. Controlar sessão e horários no formulário e separar cálculo puro de estado
   de interação em auxiliares junto do componente, conforme a arquitetura.
2. Cobrir troca de ordem, duração, alteração manual, edição e limite de meia-noite
   com testes de comportamento; incluir duração inválida como caso defensivo.
3. Executar formato, lint, estrutura, tipos, testes relevantes e build conforme
   os scripts, além da revisão semântica e verificação do diff e de segredos.

## Resultado

Diagnóstico concluído. Política e implementação aguardam aprovação; nenhuma
mudança funcional realizada. E06-T20 será tratada depois, com diagnóstico próprio.
