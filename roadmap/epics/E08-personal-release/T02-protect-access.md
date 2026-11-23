---
id: E08-T02
epic: E08
depends_on: [E08-T01]
---

# Validar exposição pública

## Objetivo

Comprovar no preview o modo público com workspace único e endurecer as proteções que não dependem de autenticação.

## Entradas

- `docs/plans/release/E08.md`
- `docs/decisions/PRIVACY-AND-OPERATIONS.md`
- `docs/decisions/PUBLIC-SINGLE-WORKSPACE-MODE.md`
- `src/lib/security/workspace.ts`
- `next.config.ts`
- Ambiente de preview publicado em E08-T01.

## Entregáveis

- Exposição aceita validada em HTTPS e configuração endurecida para produção.

## Subtarefas

- [ ] Confirmar que leitura e mutação públicas atuam somente no workspace fixo.
- [ ] Testar que `workspace_id` fornecido pelo cliente não altera ownership.
- [ ] Verificar cache privado, indexação, headers, logs e erros.
- [ ] Confirmar validação de origem, entrada e revisão nas mutações.
- [ ] Confirmar que credenciais, fontes `DO_NOT_PUBLISH` e dados de outros ambientes não são expostos.

## Validações

- Executar smoke de leitura e mutação pública contra a URL de preview e inspecionar o workspace persistido.

## Critérios de aceite

- [ ] O comportamento público corresponde ao risco aceito, sem alegar autenticação, e nenhum cliente consegue selecionar outro workspace.

## Resultado

Ainda não concluída.
