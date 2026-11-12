# Fase 1 — Identidade e histórico da execução de treino

**Estado:** proposta para revisão. Os nomes abaixo descrevem responsabilidades e não fixam tabelas Prisma. O objetivo é conseguir responder, mesmo após editar um plano: o que foi prescrito, o que mudou durante a sessão e o que foi realmente confirmado?

## Desenho proposto

| Conceito | Identidade e conteúdo | Quando existe |
|---|---|---|
| Exercício do catálogo | ID interno estável do movimento. O ID do wger é uma referência de origem. | Independente do plano. |
| Ocorrência da agenda | Identifica a atividade naquela data, inclusive quando há dois treinos iguais no mesmo dia. | Pode ser calculada. Visualizar não grava uma execução. |
| Sessão | ID gerado uma vez ao iniciar. Guarda origem, data civil, fuso, início, estimativa utilizada e prescrição inicial. | Rascunho local até finalização ou encerramento incompleto confirmado pelo servidor. |
| Item da sessão | ID próprio para cada aparição de um exercício. Referencia sessão e exercício do catálogo. Guarda ordem, papel e referência ao item prescrito, quando houver. | Criado ao iniciar ou ao adicionar exercício durante a execução. |
| Série da sessão | ID próprio, item ao qual pertence, ordem e papel (aquecimento ou trabalho). A ordem pode mudar sem mudar o ID. | Pode vir da prescrição ou ser adicionada durante a sessão. |
| Resultado da série | Vinculado ao ID da série. Contém estado explícito, medidas realmente informadas e instante de confirmação, quando houver. | Mantido no rascunho; os fatos confirmados vão ao histórico. |

Uma sessão contém vários itens; cada item contém suas séries. Dois itens podem referenciar o mesmo exercício do catálogo. A consulta “anterior” parte do exercício, mas preserva o item e a série de origem.

## Prescrição, mudanças e resultados

Ao iniciar, o dispositivo guarda a composição da sessão, preparação, exercícios, ordem, prioridade, blocos, séries, doses, unidades, cargas prescritas, descansos e estimativa disponíveis. A cópia precisa bastar para exibir o treino mesmo depois de alterar o plano. A referência ao plano e à sua versão, quando existir, ajuda a explicar a origem.

Uma mudança durante o treino modifica a prescrição efetiva da sessão. A inicial permanece consultável. Um exercício acrescentado tem item próprio e origem identificada como adição na sessão. Se o usuário escolher aplicar a mudança ao plano, salva-se imediatamente apenas aquela alteração no treino reutilizável. Uma carga **realizada** diferente da meta só atualiza o resultado.

Para cada série, distinguir sem registro, confirmada e explicitamente omitida. Digitar ou deixar um campo vazio não confirma realização. Um valor desconhecido permanece ausente. A confirmação pode ocorrer fora de ordem. A representação de omissão na interface continua em aberto.

## Fluxo de persistência

1. **Visualizar:** resolver agenda e treino sem gravar sessão. **Iniciar:** gerar IDs estáveis e salvar a prescrição inicial no dispositivo.
2. **Registrar:** manter progressivamente no rascunho os valores, confirmações e alterações. Retomar usa os mesmos IDs e o mesmo instante inicial.
3. **Finalizar:** enviar sessão, prescrição e resultados em uma operação atômica. Proposta: o servidor reconhece uma repetição da mesma operação e devolve o resultado já aceito. Uma tentativa com conteúdo divergente precisa ser resolvida explicitamente. Apagar o rascunho somente após confirmação.
4. **Expirar:** no próximo acesso após 96 horas do início, encerrar como incompleta se houver fatos confirmados. Duração real desconhecida; séries sem registro continuam identificáveis pela prescrição. Sem fatos confirmados, descartar. Falha no envio conserva o rascunho para nova tentativa.
5. **Corrigir:** até o fim do dia civil seguinte à finalização, atualizar a série pelo mesmo ID. Proposta mínima para discussão: guardar instante, valor anterior e novo valor da correção. O histórico passa a usar o valor confirmado vigente. A profundidade da trilha continua pendente.

## Cenário de aceite para revisão

| Passo | Resultado esperado |
|---|---|
| O plano contém supino no início e no fim do treino. | Mesmo exercício de catálogo, dois itens de sessão. Cada item tem sua própria série 1. |
| Na primeira aparição, a terceira série prescreve 60 kg × 10. O usuário confirma 62,5 kg × 8 antes de confirmar a primeira série. | A terceira série conserva meta e resultado distintos. Sua confirmação não altera a primeira. |
| Na segunda aparição, o usuário digita 60 kg e deixa a série sem confirmação. | O preenchimento não produz desempenho realizado. |
| O servidor aceita a finalização, mas a resposta se perde. O usuário tenta novamente. | Uma sessão, os mesmos itens e séries, um único resultado por série. O rascunho pode ser removido quando o dispositivo reconhece a confirmação. |
| Dentro da janela permitida, o usuário corrige 62,5 para 60 kg. | O mesmo ID de série passa a indicar 60 kg × 8. A meta inicial segue 60 kg × 10. |
| Em outro plano, o usuário consulta o histórico de supino. | Encontra o resultado corrigido pelo ID do exercício. As ocorrências continuam distinguíveis. Qual série usar no campo “Anterior” segue pendente. |

## Impacto a validar antes da implementação

- [Modelo de treino](../../prisma/models/training.prisma): separar a identidade da ocorrência de exercício da prescrição original e o ID da série de sua posição.
- [Contrato de mutações](../../src/features/training/application/training-mutation.types.ts) e [rascunho local](../../src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.types.ts): transportar os mesmos IDs do início até a correção, com medidas e confirmação explícitas.
- [Repositório de treino](../../src/features/training/data/prisma-training-repository.ts): rever identificação por papel/exercício e número de série, inferência por valor preenchido e resposta a reenvios.
- [Testes de integração](../../tests/integration/training-mutations.test.ts): manter a cobertura de aquecimento e confirmação fora de ordem e acrescentar o cenário acima, expiração parcial e falha na resposta.

**Decisões pendentes:** significado de carga por implemento, total, lado ou assistência; nível de detalhe da trilha de correções e das mudanças na prescrição; critério de correspondência de séries no histórico. É possível revisar as identidades e os vínculos agora. Comparações numéricas entre cargas dependem da convenção de medida aprovada.
