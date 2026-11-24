# E06-T21 — Importação externa de planos de treino

- **Tipo:** Plano.
- **Área:** Treino.
- **Tarefas relacionadas:** [E06-T21](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E06-training-execution/T21-design-external-training-plan-import.md)

> Reconciliação de 21/11/2026: Importação externa tem escopo distinto da autoria de planos e do importador Git. [Escopo e evidências](../RECONCILIATION.md#treino).

## Estado do documento

- **Escopo:** planejar a entrada assistida de planos de treino por JSON e, em
  etapa posterior, por planilha Excel.
- **Repositório alvo:** `kaizen-app`.
- **Tarefa de roadmap:** `E06-T21`.
- **Estado:** plano técnico; nenhuma implementação autorizada por este documento.
- **Evidências:** importador canônico, schemas, modelos Prisma, projeções de treino
  e auditoria do contrato atual.
- **Fora de escopo:** implementar endpoint, interface, parser Excel, migration ou
  alterar dados canônicos nesta etapa.

## Objetivo

Permitir que um plano final já revisado seja enviado pela aplicação sem exigir
que o usuário ou uma ferramenta externa conheça o snapshot Git completo usado
pelo importador canônico atual.

A entrada externa não substitui imediatamente o fluxo Git. Ela cria uma fronteira
própria para validar, revisar e confirmar um plano candidato antes de persistir ou
ativar qualquer versão.

## Decisão de arquitetura

JSON e Excel devem convergir para uma representação intermediária única,
denominada provisoriamente `PlanCandidate`.

```text
JSON enviado pelo frontend ─┐
                            ├─> PlanCandidate
Excel em template fixo ─────┘          ↓
                              validação sem persistência
                                       ↓
                                    prévia
                                       ↓
                              confirmação explícita
                                       ↓
                         importação transacional e ativação opcional
```

O contrato externo não expõe UUIDs do banco, `ImportBatch`, ponteiros de
alimentação nem a composição interna do snapshot Git. Exercícios usam IDs
canônicos já conhecidos pelo Kaizen. Valores ausentes ou referências desconhecidas
produzem erros explícitos; o sistema não inventa exercícios, doses ou unidades.

## Estratégia por fases

### Fase 1 — Contrato intermediário

- Definir schema fechado e versionado para `PlanCandidate`.
- Representar sessões, ordem, exercícios, séries, dose, descanso, notas e carga
  prescrita somente quando o modelo de treino já possuir decisão aprovada.
- Resolver exercícios pelo ID canônico e retornar erro para IDs desconhecidos.
- Separar validação pura de persistência e de ativação.
- Produzir erros localizáveis por sessão, exercício e campo.

### Fase 2 — Importação de JSON pelo frontend

- Receber arquivo JSON com limite de tamanho e tipo permitido.
- Validar origem, payload, workspace fixo quando aplicável e versão do contrato.
- Apresentar prévia antes de gravar.
- Exigir confirmação separada para importar e para ativar.
- Preservar versões anteriores, idempotência, proveniência e rollback transacional.
- Não depender do ponteiro ou do plano de alimentação.

### Fase 3 — Adaptador Excel

- Publicar um template fixo, com cabeçalhos e abas versionados.
- Converter a planilha para o mesmo `PlanCandidate` da entrada JSON.
- Informar erros por aba, linha e coluna.
- Rejeitar cabeçalhos desconhecidos, linhas duplicadas e coerções ambíguas.
- Não criar uma segunda implementação de persistência.

## Contrato externo pretendido

O contrato definitivo será aprovado na tarefa antes de implementação. Como
direção, ele deve conter:

| Conceito | Regra |
| --- | --- |
| Versão do contrato | Obrigatória e independente da versão do plano |
| Plano | ID lógico, versão, nome ou objetivo quando aprovados e datas necessárias |
| Sessão | ID estável, nome, duração e ordem explícita |
| Exercício | `exerciseId` canônico; nenhum UUID fornecido pelo cliente |
| Séries | Quantidade prescrita e, se necessário, variações por série |
| Dose | mínimo, máximo, unidade, escopo e qualificador estruturados |
| Carga | somente após decisão da E06-T06 ou contrato equivalente |
| Descanso | segundos, quando aplicável |
| Notas | texto simples; não substitui campos estruturados |
| Ativação | intenção separada da criação e confirmação explícita |

## Ordem de implementação prevista

| Ordem | Ação | Caminho | Finalidade |
| ---: | --- | --- | --- |
| 1 | Editar | `docs/architecture/TARGET-ARCHITECTURE.md` | Registrar a nova fronteira somente após a decisão ser aprovada |
| 2 | Criar | `src/features/training-plan-import/domain/` | Contrato intermediário, erros e regras puras |
| 3 | Criar | `src/features/training-plan-import/application/` | Validar, preparar prévia, importar e ativar em operações separadas |
| 4 | Criar | `src/features/training-plan-import/data/` | Adaptadores do contrato para Prisma e, futuramente, Excel |
| 5 | Editar | `prisma/models/training.prisma` | Somente se o contrato aprovado exigir campos ainda não persistidos |
| 6 | Criar | `src/features/training-plan-import/ui/` | Upload, erros, prévia e confirmação |
| 7 | Criar | `src/app/treino/importar/page.tsx` | Entrada server-side da jornada de importação |
| 8 | Criar | testes unitários e de integração próximos à feature | Provar validação, atomicidade, idempotência e histórico |

Os caminhos novos são a proposta inicial da tarefa. A implementação deve primeiro
verificar se a responsabilidade pertence a `plan-definition-import` ou justifica
uma feature própria; não deve criar as duas abstrações em paralelo.

## Regras de segurança e integridade

- Server Actions e Route Handlers são fronteiras públicas e validam origem,
  entrada e tamanho no servidor.
- O cliente nunca envia `workspace_id` nem UUID técnico de definição.
- Importar não ativa silenciosamente.
- Ativar não remove versões, atribuições ou execuções anteriores.
- Uma falha não deixa plano parcial nem altera a ativação vigente.
- A prévia não grava no banco.
- Arquivos e mensagens de erro não expõem caminhos privados, SQL ou segredos.
- Excel aceita apenas template conhecido; planilha arbitrária não é interpretada
  por heurística nesta entrega.

## Validação prevista

1. Validar schema e regras puras do `PlanCandidate`.
2. Testar IDs desconhecidos, dose incompatível, duplicatas e campos extras.
3. Testar prévia sem escrita.
4. Testar importação repetida e conflito de versão.
5. Testar rollback após falha intermediária.
6. Testar ativação explícita e preservação do histórico.
7. Testar isolamento do workspace e rejeição de ownership vindo do cliente.
8. Executar `pnpm run ci` e `git diff --check`.

## Critérios de aceite da solução futura

- [ ] JSON e Excel convergem para o mesmo contrato intermediário.
- [ ] O JSON pode ser validado e visualizado antes de qualquer escrita.
- [ ] Exercícios usam IDs canônicos; o cliente não inventa UUIDs.
- [ ] Erros identificam campo e localização sem vazar detalhes internos.
- [ ] Importação e ativação são operações distintas e confirmadas.
- [ ] Nova versão não sobrescreve plano nem execução histórica.
- [ ] O fluxo de treino não depende do ponteiro ou plano alimentar.
- [ ] A importação continua atômica e idempotente.
- [ ] O importador Git permanece disponível para deploy, recuperação e dados
      versionados enquanto houver consumidor real.

## Rollback

Antes de ativar a nova entrada, manter o importador Git como caminho operacional.
Uma falha na nova jornada deve permitir desabilitar sua rota e interface sem
alterar as definições já importadas. Ativações incorretas são revertidas por nova
ativação de uma versão válida; versões e históricos não são apagados.

## Decisões pendentes

- Se o JSON externo será armazenado integralmente como proveniência.
- Qual identidade substitui `sourcePath + SHA-256` para uploads.
- Se a primeira entrega apenas cria a versão ou também oferece ativação.
- Como carga prescrita será representada após a decisão da E06-T06.
- Qual limite de arquivo e política de retenção serão usados.
- Se Excel entra na mesma implementação ou em tarefa posterior após estabilizar
  o contrato JSON.
