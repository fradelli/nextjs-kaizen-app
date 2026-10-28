---
id: E10-T01
epic: E10
depends_on: [E06-T25]
---

# Integrar a linguagem visual do portfólio no Kaizen

## Objetivo

Atualizar a fundação e as telas existentes para que o Kaizen pareça uma extensão do
portfólio: mesmos materiais, tipografia, proporções, estados visuais e ritmo, sem copiar
animações ou elementos decorativos.

## Entradas

- `docs/implementation/FRADELLI-DESIGN-SYSTEM-ADOPTION-PLAN.md`
- `docs/implementation/ICONOGRAPHY-STANDARDIZATION-PLAN.md`
- `docs/implementation/TRAINING-ACTIVITY-PLAYER-AND-FEEDBACK-PLAN.md`
- `docs/architecture/TARGET-ARCHITECTURE.md`
- `docs/decisions/SHARED-DESIGN-SYSTEM-ADOPTION.md`
- `package.json` e `pnpm-lock.yaml`
- `src/app/globals.css` e `src/app/layout.tsx`
- `src/components/shared/app-shell/app-shell.tsx`
- `src/components/shared/app-shell/app-shell.module.css`
- `src/components/shared/feature-placeholder/feature-placeholder.tsx`
- `src/features/training/ui/components/training-day-page/training-day-page.styles.ts`

## Escopo

- Concluir o catálogo completo e os estados genéricos de Button no DS conforme os planos.
- Consumir a última versão publicada compatível por pin exato, integrando
  public CSS, Tailwind source e exports sem deep imports.
- Corrigir contraste e aliases locais; aproximar superfícies, geometria, espaçamento,
  tipografia, campos, ações, mensagens, navegação e overlays da referência.
- Registrar estilos específicos reproduzidos do portfólio e sua responsabilidade local.
- Manter fundo uniforme; remover animações e movimento nos controles abrangidos sem
  perder interação, foco, estados pendentes ou preferência de redução de movimento.
- Preservar rotas, conteúdo, formulários, dados, regras e estados do Kaizen.

## Fora de escopo

Estrelas, partículas, ilustrações e animações do portfólio; redesign de conteúdo; novas
funcionalidades de alimentação; mudanças em dados/migrations. O player e o formulário
de encerramento pertencem à E10-T02. O release do DS seguirá exclusivamente o workflow oficial.

## Critérios de aceite

- [x] Comparação lado a lado mostra linguagem visual coerente em dieta, treino e shell.
- [x] Superfícies, tipografia, paleta semântica, botões, campos e estados seguem a referência.
- [x] Sem animação/partículas/estrelas e com mudanças de estado funcionais imediatas.
- [x] Sem overflow nos breakpoints 320, 390, 768 e 1440px; foco e contraste legíveis.
- [x] Fluxos, nomes/valores submetidos e regras de negócio permanecem preservados.
- [x] Formatação, lint, estrutura, tipos, 377 testes e build aprovados.

## Resultado

Fundação visual integrada ao portfólio, preservando o conteúdo e as regras. Versão
publicada `@fradelli/ui@0.6.0` instalada por pin exato após as PRs 19 e 20 do DS.
Ícones individuais, guard de imports/símbolos, superfícies de vidro, Inter, geometria
e estados oficiais integrados. Sem estrelas, partículas ou animações.

Validação: 377 testes; cobertura de linhas 90,76% na fundação; 41 testes dos scripts;
lint, estrutura, tipos e build aprovados. Dieta/treino carregados no banco sintético
em 320/390/768/1440px sem overflow. O roteiro do player continua na E10-T02.
