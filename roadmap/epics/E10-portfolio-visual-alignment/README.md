# E10 — Alinhamento visual com o portfólio

## Resultado esperado

O Kaizen parece uma extensão do portfólio, com a mesma linguagem visual estática e
sem alterar conteúdo, funcionalidades ou regras de negócio. Animações, estrelas e
partículas ficam fora da experiência.

## Sequência

| Tarefa | Depende de | Resultado |
| --- | --- | --- |
| E10-T01 | E06-T25 | Integrar referência visual, catálogo de ícones e estados genéricos do DS |
| E10-T02 | E10-T01 | Player no card, dicas coerentes e encerramento em modal com rascunho |

## Limites

- O portfólio publicado é a referência final; `@fradelli/ui` fornece os tokens e primitives disponíveis.
- Complementos locais reproduzem estilos estáticos do portfólio quando não houver contrato público equivalente.
- Conteúdo e comportamento de Dieta/Treino permanecem próprios do Kaizen.
- Não copiar animações, fundo estrelado, partículas ou ilustrações.
