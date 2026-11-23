---
id: E12-T02
epic: E12
depends_on: []
---

# Aplicar headers de segurança e páginas de erro e carregamento

## Objetivo

Proteger a aplicação pública com headers HTTP de segurança e cobrir erro, rota inexistente e carregamento com telas próprias.

## Contexto

Achados da auditoria de 2026-11-23:

- `next.config.ts` não define `headers()`: faltam Content-Security-Policy, `frame-ancestors` ou `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` e `X-Content-Type-Options`.
- `src/app` não tem `not-found.tsx`, `global-error.tsx` nem `loading.tsx`; só existe `src/app/workout/error.tsx`.
- `src/lib/security/request-origin.ts` confia em `x-forwarded-host`, premissa válida atrás do proxy da Vercel e não registrada.

## Entradas

- `next.config.ts` — configuração atual.
- `src/app/layout.tsx` e `src/app/workout/error.tsx` — layout raiz e tratamento de erro existente.
- `src/lib/security/request-origin.ts` — validação de origem.
- `docs/architecture/TARGET-ARCHITECTURE.md` — seções "Segurança" e "Observabilidade e falhas".
- `docs/product/telas/guia-de-estilo.md` — aparência das telas de estado.

## Entregáveis

- `headers()` em `next.config.ts` com CSP compatível com `next/font`, `next-intl` e o design system.
- `src/app/not-found.tsx`, `src/app/global-error.tsx` e `loading.tsx` nas rotas com leitura dinâmica.
- Textos novos em `messages/en.json` e `messages/pt-BR.json`.
- Premissa de proxy confiável registrada na seção "Segurança" da arquitetura.

## Subtarefas

- [ ] Definir e aplicar os headers.
- [ ] Testar a CSP em desenvolvimento e build sem violações no console.
- [ ] Criar as telas de rota inexistente, erro global e carregamento.
- [ ] Registrar a premissa de proxy.

## Validações

- `pnpm build` passa e a resposta de `/workout` traz os headers definidos.
- O console do navegador não mostra violações de CSP nas rotas existentes.
- Testes de UI cobrem as novas telas; `pnpm i18n:check` passa.

## Critérios de aceite

- [ ] Todas as respostas HTML trazem os headers de segurança.
- [ ] Uma URL inexistente mostra a tela própria, traduzida.
- [ ] Erro no layout raiz mostra a tela de erro global.

## Resultado

Não iniciada.
