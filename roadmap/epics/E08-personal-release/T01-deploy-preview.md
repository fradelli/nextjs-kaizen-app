---
id: E08-T01
epic: E08
depends_on: [E06-T05, E07-T05]
---

# Publicar preview

## Objetivo

Conectar o projeto à Vercel e publicar um preview verificável sem promover produção.

## Entradas

- `docs/plans/release/E08.md`
- `docs/decisions/PRIVACY-AND-OPERATIONS.md`
- `docs/decisions/PUBLIC-SINGLE-WORKSPACE-MODE.md`
- `docs/decisions/CI-CD-GOVERNANCE.md`
- `.github/workflows/`
- `prisma/migrations/`
- `src/app/`
- `tests/e2e/`

## Entregáveis

- Projeto Vercel, variáveis de preview e deploy funcional.

## Subtarefas

- [ ] Vincular o repositório e definir diretório de build.
- [ ] Configurar banco e segredos exclusivos de preview.
- [ ] Associar `staging` ao preview estável.
- [ ] Executar CI no SHA promovido e confirmar o checkout imutável.
- [ ] Usar Vercel CLI fixada, build prebuilt e uma única execução de deploy por vez.
- [ ] Aplicar migrations compatíveis antes do deploy.
- [ ] Executar smoke público de leitura e mutação no workspace fixo.
- [ ] Documentar promoção e diagnóstico de falhas.

## Validações

- Executar smoke test no endereço de preview.

## Critérios de aceite

- [ ] Preview constrói a partir do Git sem segredo versionado.

## Resultado

Ainda não concluída.
