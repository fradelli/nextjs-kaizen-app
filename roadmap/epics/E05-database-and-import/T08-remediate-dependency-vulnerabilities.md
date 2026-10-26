---
id: E05-T08
epic: E05
depends_on: [E05-T02]
---

# Corrigir vulnerabilidades de dependências

## Objetivo

Corrigir os achados da auditoria de 26/10/2026 em branch separada, comprovar
compatibilidade e integrar a PR antes da E06-T19.

## Entradas

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `.github/workflows/ci.yml`
- `.github/pull_request_template.md`

## Evidência inicial

`pnpm audit --json`: 19 achados, sendo 3 baixos, 10 moderados, 4 altos e 2 críticos.

| Pacote         | Versão detectada | Menor correção informada pelo scanner |
| -------------- | ---------------- | ------------------------------------- |
| next           | 16.3.8           | 16.4.1                                |
| zod            | 4.6.5            | 4.6.6                                 |
| @vitest/mocker | 4.1.11           | 4.1.12                                |
| vite           | 8.2.2            | 8.2.4                                 |
| undici         | 8.10.2           | 8.12.2                                |
| fast-uri       | 3.1.8            | 3.1.9                                 |

## Política

- Atualizar Next.js e eslint-config-next juntos; manter Vitest e coverage-v8 alinhados.
- Atualizar Zod na mesma linha principal e regenerar resoluções transitivas compatíveis.
- Não editar o lockfile manualmente nem usar supressões ou reduzir o nível da auditoria.
- Preservar o fork de braces e os overrides anteriores que não pertencem aos achados atuais.
- Não incorporar mudanças do Design System ou funcionalidades nesta branch.

## Validação e integração

- [x] Instalação congelada e auditoria sem achados.
- [x] Formato, lint, estrutura, tipos e integridade de dados aprovados.
- [x] Testes unitários, PostgreSQL, backup/restore e build aprovados.
- [ ] PR de segurança com CI aprovada e merge em developer.
      A integração da E06-T19 é a etapa seguinte, após o merge desta correção; não
      faz parte dos critérios de encerramento da correção de dependências.

## Rastreabilidade dos achados

Fonte: relatório inicial de `pnpm audit --json` em 26/10/2026 e advisories primários
referenciados abaixo. A faixa vulnerável é a informada pelo scanner.

| Advisory                                                                 | Pacote         | Severidade | Faixa vulnerável         | Versão aplicada |
| ------------------------------------------------------------------------ | -------------- | ---------- | ------------------------ | --------------- |
| [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv) | vite           | moderate   | `>=8.2.0 <=8.2.3`        | 8.2.4           |
| [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw) | vite           | moderate   | `>=8.2.0 <=8.2.3`        | 8.2.4           |
| [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) | vite           | high       | `>=8.2.0 <=8.2.3`        | 8.2.4           |
| [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw) | vite           | low        | `>=8.2.0 <=8.2.3`        | 8.2.4           |
| [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) | vite           | moderate   | `>=8.2.0 <=8.2.3`        | 8.2.4           |
| [GHSA-vfpm-58rq-9qcg](https://github.com/advisories/GHSA-vfpm-58rq-9qcg) | vite           | moderate   | `>=8.2.0 <=8.2.3`        | 8.2.4           |
| [GHSA-qxg6-89mg-rqv8](https://github.com/advisories/GHSA-qxg6-89mg-rqv8) | @vitest/mocker | moderate   | `>=2.1.0-beta.7 <4.1.12` | 4.1.12          |
| [GHSA-xp26-3454-mjgp](https://github.com/advisories/GHSA-xp26-3454-mjgp) | @vitest/mocker | moderate   | `>=4.1.11 <4.1.12`       | 4.1.12          |
| [GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw) | next           | critical   | `>=16.0.0 <=16.4.0`      | 16.4.2          |
| [GHSA-p3m5-59mp-jv5r](https://github.com/advisories/GHSA-p3m5-59mp-jv5r) | next           | high       | `>=16.0.0 <=16.4.0`      | 16.4.2          |
| [GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr) | next           | critical   | `>=16.0.0 <=16.4.0`      | 16.4.2          |
| [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) | zod            | high       | `<4.6.6`                 | 4.6.7           |
| [GHSA-4qv8-2p9j-2685](https://github.com/advisories/GHSA-4qv8-2p9j-2685) | undici         | moderate   | `>=8.0.0 <8.12.2`        | 8.12.3          |
| [GHSA-f72v-6w45-q472](https://github.com/advisories/GHSA-f72v-6w45-q472) | undici         | moderate   | `>=8.0.0 <8.12.2`        | 8.12.3          |
| [GHSA-w74x-v6f9-j3xg](https://github.com/advisories/GHSA-w74x-v6f9-j3xg) | fast-uri       | moderate   | `>=3.0.0 <3.1.9`         | 3.1.9           |
| [GHSA-xhq7-xmqj-769h](https://github.com/advisories/GHSA-xhq7-xmqj-769h) | fast-uri       | low        | `>=3.0.0 <3.1.9`         | 3.1.9           |
| [GHSA-wjr9-j795-jxcr](https://github.com/advisories/GHSA-wjr9-j795-jxcr) | fast-uri       | moderate   | `>=3.1.3 <3.1.9`         | 3.1.9           |
| [GHSA-333x-w4r6-6crp](https://github.com/advisories/GHSA-333x-w4r6-6crp) | fast-uri       | low        | `>=3.0.0 <3.1.9`         | 3.1.9           |
| [GHSA-xjj6-f33q-929c](https://github.com/advisories/GHSA-xjj6-f33q-929c) | undici         | high       | `>=8.0.0 <8.12.2`        | 8.12.3          |

## Resoluções aplicadas

- Next.js e eslint-config-next: 16.3.8 → 16.4.2.
- Zod direto e transitivo de eslint-plugin-react-hooks: 4.6.5 → 4.6.7.
- Vitest, mocker e coverage-v8: 4.1.11 → 4.1.12.
- Vite transitivo de Vitest/mocker: 8.2.2 → 8.2.4.
- Undici transitivo de jsdom: 8.10.2 → 8.12.3.
- fast-uri transitivo de AJV: 3.1.8 → 3.1.9.
- O pnpm regenerou as resoluções de peers; não foram mantidos overrides novos
  nem dependências diretas artificiais. `pnpm install --frozen-lockfile` aprovado.
- Auditoria final local: zero achados em todas as severidades.

## Resultado

Correções implementadas. `pnpm run ci` aprovado (291 testes unitários, 44
integrações e 33 testes de validadores), assim como o teste de backup/restore
PostgreSQL. Auditoria local sem achados; governança local aprovada.
CI remota e integração da PR ainda pendentes.
