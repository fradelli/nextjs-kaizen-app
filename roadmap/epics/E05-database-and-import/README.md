[ERROR] - (starship::print): Under a 'dumb' terminal (TERM=dumb).

# E05 — Banco, importação e acesso

## Resultado esperado

Banco escolhido, migrations versionadas, importação idempotente e workspace fixo server-only prontos para os registros operacionais. Autenticação foi adiada por decisão explícita.

## Ordem

| Tarefa  | Depende de       | Resultado                                            |
| ------- | ---------------- | ---------------------------------------------------- |
| E05-T01 | E03-T05          | Modelo relacional aprovado                           |
| E05-T02 | E04-T03, E05-T01 | Banco e migrations                                   |
| E05-T03 | E05-T02          | Importação idempotente                               |
| E05-T04 | E05-T03          | Integridade testada                                  |
| E05-T05 | E05-T04          | Backup/restore local validado                        |
| E05-T06 | E05-T05          | Cancelada; modo público com risco aceito documentado |
| E05-T07 | E05-T04          | Semântica e fronteiras do código verificadas         |

| E05-T08 | E05-T02 | Auditoria sem vulnerabilidades e compatibilidade validada |

## Fora de escopo

- Domínios posteriores ao P0.
- Cadastro, login, autenticação, edição de planos pela interface ou features fora do P0.

## Critérios de encerramento

- [x] Importação repetida não duplica dados.
- [x] Origem, versão e plano ativo permanecem rastreáveis.
- [x] Atribuições e execuções pertencem ao workspace e preservam a versão apresentada.
- [x] O workspace fixo é resolvido no servidor; autenticação futura possui gate explícito antes de multiusuário.
