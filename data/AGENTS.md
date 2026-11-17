# Instruções dos dados

## Fonte de verdade

- `active.json` e `nutrition/active.json` apontam as versões vigentes.
- Arquivos em `plans/` são versões imutáveis; crie nova versão em vez de reescrever histórico.
- `exercises.json` mantém IDs `snake_case` estáveis.
- O banco importa definições; não se torna editor dos planos durante o P0.

## Segurança e exposição

O repositório é público. Todo conteúdo migrado deve possuir tratamento e exposição aprovados no manifesto. Não adicione identidade, contato, contexto médico desnecessário, comentários operacionais, credenciais ou caminhos privados. Na dúvida, não publique e registre a lacuna.

## Edição e validação

- Datas usam `YYYY-MM-DD`, horários `HH:MM` e fuso `America/Sao_Paulo`.
- Preserve `null` e `unknowns`; não complete fatos por inferência.
- Valide parse, JSON Schema, IDs, ponteiros, referências cruzadas e arquivos derivados.
- Mudança material atualiza `last_updated`, documentação derivada e `CHANGELOG.md` quando aplicável.
- Dados operacionais pertencem ao banco e nunca a esta árvore versionada.
