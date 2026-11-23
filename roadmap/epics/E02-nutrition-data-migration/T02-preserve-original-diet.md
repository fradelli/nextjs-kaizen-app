---
id: E02-T02
epic: E02
depends_on: [E02-T01]
external: ["dieta fornecida"]
---

# Preservar dieta original

## Objetivo

Registrar a fonte alimentar original sem corrigir, completar ou promovê-la a plano vigente.

## Entradas

- Inventário corrigido de E02-T01.
- Commit privado `138531e4fbca6d744de73274fbb96da39c02bad3`.

## Entregáveis

- Snapshot e tag imutáveis no repositório privado.
- Blobs originais preservados somente na origem privada.
- Linhas de manifesto com referências seguras, hashes, tratamento e exposição.

## Subtarefas

- [x] Criar snapshot privado sem reescrever os caminhos históricos.
- [x] Usar nomes neutros em cópias privadas byte a byte quando necessário para a proveniência pública.
- [x] Calcular integridade diretamente dos blobs do snapshot.
- [x] Criar a tag privada `kaizen-nutrition-source-v1`.
- [x] Registrar originais como `SKIP/DO_NOT_PUBLISH` no destino público.
- [x] Marcar planos derivados como não vigentes até revisão.

## Validações

- Cópias privadas literais mantêm os hashes dos blobs históricos.
- A tag e o commit existem no remote privado.
- Nenhum conteúdo alimentar ou caminho pessoal entra no repositório público.
- Nenhuma recomendação é adicionada ao original.

## Critérios de aceite

- [x] A revisão pode voltar à fonte exata por referência privada imutável.
- [x] O destino público contém somente proveniência segura.

## Resultado

Snapshot privado publicado no commit `0d6456a68329f51fb9f83e1230cb285fe82f5996` e fixado pela tag `kaizen-nutrition-source-v1`. Os oito blobs foram preservados sob aliases neutros com identidade confirmada pelos objetos Git e hashes SHA-256. O Kaizen registra somente metadados `SKIP/DO_NOT_PUBLISH`; nenhum conteúdo alimentar foi publicado.
