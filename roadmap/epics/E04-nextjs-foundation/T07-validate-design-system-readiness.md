---
id: E04-T07
epic: E04
depends_on: [E04-T05, E04-T06]
---

# Validar prontidão técnica para o Design System

## Objetivo

Determinar, sem instalar o package, se a base técnica do Kaizen está pronta para receber `@fradelli/ui@0.1.0` de forma reproduzível.

## Contexto

`@fradelli/ui@0.1.0` já foi publicado de forma privada no GitHub Packages. Node 24.20.0 e React 19.2.8 atendem aos engines e peers do package. E04-T02 está integrada em `developer`, mas seus gates precisam ser reexecutados com o CI de E04-T05 antes deste gate; a estratégia segura de autenticação também precisa ser comprovada antes da instalação.

## Entradas

- `docs/decisions/SHARED-DESIGN-SYSTEM-ADOPTION.md`
- `package.json`
- `pnpm-lock.yaml`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `.github/workflows/ci.yml`
- `https://github.com/fradelli/design-system/blob/3e0c23f591ff458ab9e3e74dc44bb0cdba068a03/package.json`

## Escopo

- Confirmar versões de Node, pnpm, Next.js, React e React DOM.
- Confirmar o contrato publicado: versão, engines, peers, exports, CSS público, `dist` e primitives.
- Verificar que E04-T02 e E04-T05 entregaram gates e CI verdes antes da integração visual.
- Planejar registry e autenticação local/CI sem gravar credenciais.
- Registrar decisão GO/NO-GO e gaps remanescentes em relatório sanitizado.

## Fora do escopo

- Instalar `@fradelli/ui`, Tailwind CSS, PostCSS ou fontes.
- Alterar `package.json`, lockfile, CSS, root, componentes ou workflow.
- Implementar shell, calendário ou tela de domínio.

## Entregáveis

- `docs/evidence/design-system/E04-T07-DESIGN-SYSTEM-READINESS.md`
- Matriz de compatibilidade, checklist dos gates e decisão GO/NO-GO.

## Subtarefas

- [x] Confirmar runtime, package manager e peer React sem instalar o package.
- [x] Confirmar gates locais e CI existentes e verdes.
- [x] Documentar autenticação segura local e no workflow.
- [x] Registrar contrato público de `@fradelli/ui@0.1.0` e decisão de prontidão.

## Validações

- Executar format check, lint, typecheck, testes, cobertura e build já disponíveis.
- Confirmar React `>=19.2.7 <20` e Node `>=24.20.0 <25`.
- Confirmar que o workflow possui base para instalação congelada e permissão mínima futura.
- Confirmar que o diff não contém package, `.tgz`, token, credencial ou configuração autenticada.

## Critérios de aceite

- [x] A matriz confirma compatibilidade de runtime e React com `@fradelli/ui@0.1.0`.
- [x] Formato, lint, typecheck, testes, cobertura e build passam localmente e no CI.
- [x] O relatório identifica autenticação local ainda ausente ou comprovada sem expor segredo.
- [x] A decisão GO/NO-GO lista todos os gaps sem instalar ou alterar a aplicação.

## Riscos

- Confundir permissão Read concedida ao repositório com autenticação local configurada.
- Aprovar prontidão apesar de gates ou CI ausentes.
- Contrato `0.x` mudar sem nova versão exata e nova validação.

## Rollback

Reverter somente o relatório e a atualização de status. Como a tarefa não instala dependências nem altera a aplicação, não há rollback técnico de runtime.

## Resultado

Concluída em 2026-09-10 com decisão NO-GO. Runtime, peers, contrato publicado, gates locais, CI remoto e rulesets foram comprovados. A integração permanece bloqueada porque a consulta ao GitHub Packages retornou `401` sem autenticação e a credencial usada pela API não possui `read:packages`. Nenhum package, token ou arquivo da aplicação foi adicionado.

## Consolidação documental de 12/11/2026

Preservadas avaliação sem instalação, NO-GO inicial e GO posterior no relatório original de evidência; isso não aprova releases novos.

[Pacote original integral](https://github.com/fradelli/nextjs-kaizen-app/blob/fd2269d2eaa7d55cfea724631f12fa6505d37b32/docs/implementation/tasks/E04-T07.md), SHA-256 `02f79c4fda7e11d5b54c1ffb48f8b04da72a5465a802845806adea33cab0d427`. Comandos, critérios, riscos e rollback registram aquela base e não são receita para reinstalar a aplicação atual. Pendências não viraram aprovações nesta consolidação.
