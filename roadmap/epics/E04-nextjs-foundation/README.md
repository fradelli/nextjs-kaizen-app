# E04 — Fundação Next.js

## Resultado esperado

Aplicação Next.js mínima, sem features de negócio, com boundaries, gates de qualidade e Design System compartilhado validado e integrado por versão exata.

## Ordem

| Tarefa | Depende de | Resultado |
| --- | --- | --- |
| E04-T01 | E03-T05, E00-T07 | Scaffold validado |
| E04-T02 | E04-T01 | Qualidade estática |
| E04-T06 | E04-T02 | Decisão de adoção e arquitetura atualizadas |
| E04-T03 | E04-T02 | Boundary server-only |
| E04-T05 | E04-T02, E04-T03, E04-T06 | CI mínimo antes da adoção visual |
| E04-T07 | E04-T05, E04-T06 | Prontidão técnica decidida sem instalar o package |
| E04-T08 | E04-T07 | `@fradelli/ui@0.1.0` integrado pelo GitHub Packages |
| E04-T04 | E04-T08 | Shell acessível sobre o Design System |
| E04-T09 | E04-T04 | Páginas React e fronteiras Server/Client padronizadas |

## Fora de escopo

- Regras, páginas finais, banco produtivo ou deploy.
- Calendário compartilhado, domínio ou componentes específicos do Kaizen no package.

## Critérios de encerramento

- [x] Lint, tipos, testes e build passam.
- [x] Instalação congelada resolve exatamente `@fradelli/ui@0.1.0`.
- [x] Inter, dark, CSS público, `@source` e foundations estão validados antes do shell.
- [x] Não há regra de treino ou alimentação em componentes/rotas.
- [ ] Páginas existentes seguem a organização por responsabilidade e a menor fronteira Client possível.
