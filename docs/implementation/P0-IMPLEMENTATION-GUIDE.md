# Índice de implementação do P0

Comece pelo contrato raiz, tarefa selecionada e entradas por seção. Este índice não duplica versões, regras nem status.

| Assunto | Fonte | Uso |
| --- | --- | --- |
| Produto | [P0](../product/P0.md), [telas](../product/telas/README.md) | Regras e experiência; distinguir futuro |
| Código | [Arquitetura](../architecture/TARGET-ARCHITECTURE.md) | Seção de semântica, boundaries, React ou Prisma |
| Fundação E04 | [Tarefas](../../roadmap/epics/E04-nextjs-foundation/README.md) | Resultados históricos; não recriar scaffold |
| Persistência | [E05](E05.md) | Seção operacional necessária |
| Treino inicial | [E06](E06.md) | Histórico; comportamento atual nas telas/tarefas |
| Alimentação | [E07](E07.md) | Futuro; interface ainda placeholder |
| Publicação | [E08](E08.md) | Futuro; reconfirmar ambiente, custos e limites |
| Aparência | [Guia Mira](../product/telas/guia-de-estilo.md), [adoção](../product/telas/componentes-shadcn.md) | Diretriz e migração em andamento |
| Agenda | [Etapas](MEU-DIA-IMPLEMENTACAO.md) | Somente fase residual |
| i18n | [UI](I18N-UI-IMPLEMENTATION.md), [proposta editorial](I18N-PT-EN-PLAN.md) | Não tratar banco proposto como entregue |
| Catálogo | [Plano/operação](CATALOG-IMPORT-PLAN.md) | Carga versus aprovação editorial |

## Estado e manutenção

Status no [roadmap](../../roadmap/README.md); versões em package/lockfile/configuração do runtime. Não copiar pins históricos. Git/JSON define planos e banco guarda operação, conforme [transição](../decisions/DATA-SOURCE-TRANSITION.md). Acesso [público com workspace único](../decisions/PUBLIC-SINGLE-WORKSPACE-MODE.md); pareamento antigo não está ativo.

Planos concluídos preservam evidências, não autorizam repetir implementação. Mudança estrutural exige decisão substituta explícita. Pacotes consolidados têm [origens preservadas](../documentation-review.md#consolidações-e-origens).

## Gates e rollback

Gates proporcionais no contrato raiz e package. Rollback de aplicação não reverte migrations nem reescreve histórico. [Backup local](../operations/BACKUP-AND-RESTORE.md) não configura produção. Publicação e armazenamento ficam sob E08; segredos e IDs reais permanecem fora do Git.
