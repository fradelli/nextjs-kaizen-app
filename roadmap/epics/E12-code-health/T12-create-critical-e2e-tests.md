---
id: E12-T12
epic: E12
depends_on: [E12-T02]
---

# Criar testes E2E das jornadas críticas

## Objetivo

Cobrir as jornadas críticas de treino e agenda com Playwright em PostgreSQL real, como prevê a estratégia de testes da arquitetura.

## Contexto

A arquitetura lista Playwright para jornadas críticas, mas o projeto não tem nenhum teste E2E. O `.gitignore` já reserva `playwright-report/` e `test-results/`. A suíte atual tem testes unitários, de UI em jsdom e de integração com banco.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md` — seções "Estratégia de testes" e "Casos obrigatórios".
- `compose.yaml` — banco de teste local.
- `.github/workflows/ci.yml` — job Test com serviço PostgreSQL.
- `scripts/test-i18n-http.mjs` — verificação HTTP de idioma, candidata a virar caso E2E.

## Entregáveis

- Playwright instalado com versão exata e configuração em `tests/e2e/`.
- Jornadas: abrir o dia, incluir e editar atividade, executar e concluir treino, conflito entre abas, mutação da agenda e troca de idioma.
- Job de E2E no CI com banco descartável.

## Subtarefas

- [ ] Configurar Playwright, servidor de teste e semente de dados.
- [ ] Escrever as jornadas.
- [ ] Incluir o job no CI.
- [ ] Decidir o destino de `scripts/test-i18n-http.mjs`.

## Validações

- Os testes E2E passam localmente e no CI.
- Uma regressão proposital numa jornada faz o job falhar.

## Critérios de aceite

- [ ] As jornadas críticas listadas rodam a cada PR.
- [ ] O tempo do job fica registrado na PR.

## Resultado

Não iniciada.
