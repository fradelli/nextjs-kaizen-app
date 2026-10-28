# Validação da integração visual e do registro de treino

## Resultado

Kaizen utiliza `@fradelli/ui@0.6.0` publicado oficialmente, com catálogo Phosphor
2.1.10 completo e imports individuais. A aparência segue a referência estática do
portfólio; conteúdo, rotas e regras continuam próprios do Kaizen. Sem estrelas,
partículas ou animações. PRs do DS: [19](https://github.com/fradelli/design-system/pull/19)
e [20](https://github.com/fradelli/design-system/pull/20).

Treinos guiados e mobilidade oferecem Play/Pausa/Stop no cabeçalho. Prática esportiva
e treino específico sem execução anterior usam CheckCircle para registrar diretamente,
sem cronômetro. Execuções externas históricas preservam seu contrato. Mobilidade
mantém somente comentário; os demais tipos exigem intensidade e disposição explícitas.

Stop captura e guarda a pausa antes de abrir o modal. O servidor valida identidade,
revisão, ownership, intervalos e horário de encerramento. O tempo de preenchimento não
entra na duração ativa; `completedAt` continua sendo a confirmação de persistência.
O formulário preserva campos em erros e bloqueia fechamento e duplicação durante envio.

## Verificações executadas

- `pnpm run ci`: schema, formatação, lint, fronteiras, tipos, cobertura, integrações,
  scripts de governança/dados, build e auditoria aprovados. Após a proteção adicional
  de armazenamento, cobertura e verificações afetadas foram repetidas.
- 389 testes da aplicação; cobertura de linhas 90,28%, branches 83,83%, funções 90,29%
  e statements 88,56%; 53 integrações PostgreSQL; 41 testes dos scripts.
- Auditoria do Kaizen sem vulnerabilidades conhecidas. O DS passou seu gate oficial;
  sua auditoria de produção ficou zerada e achados de desenvolvimento abaixo do gate
  alto foram documentados na PR do pacote.
- Chromium com dados sintéticos em banco separado, no contêiner descartável de testes.
  Portas, workspace e IDs foram conferidos antes de renovar a fixture; banco pessoal
  não foi utilizado para simular atividades.
- Larguras 320, 390, 768 e 1440px: treino expandido sem overflow horizontal, ícones de
  20px em alvos de 44px e rótulo de série legível em uma linha.
- Play/Pausa/Retomar/Stop; cronômetro congelado durante o modal; Escape, retorno de
  foco, recarga e recuperação; confirmação de séries pendentes e gravação real.
- Registro externo sem executionDraft, relógio ou horários fictícios; falha de rede
  preserva avaliação; fechamento/reabertura e envio posterior funcionam.
- Dicas com fundo elevado, borda externa arredondada em hover e outline em foco;
  amarelo com alpha 250/255 no hover e opacidade 1 do botão; cursor pointer.
- Preferência de movimento reduzido sem animação e nenhum erro de página observado.

As capturas usam exclusivamente dados sintéticos. [Verificações do navegador](evidence/player-2026-10-28/browser-checks.json).

## Achados corrigidos durante a validação

1. A constraint antiga exigia minuto final maior que inicial, rejeitando uma execução
   curta e a virada do dia. A migration adicional
   `20261028010000_allow_short_training_activity_times` valida somente a faixa dos
   rótulos de relógio; timestamps e intervalos mantêm ordem e duração. Não altera
   registros existentes nem modifica migrations anteriores.
2. O reset automático do formulário após uma Server Action limpava os selects no DOM.
   O formulário agora impede esse reset e mantém seleção/comentário em falhas.
3. Em 320px, o título da série se dividia em várias linhas. A navegação pode ocupar
   uma nova linha sem reduzir o texto; o título da atividade usa o papel tipográfico
   público do DS no conteúdo do botão.
4. Uma falha ao guardar a pausa exige escolha explícita antes de fechar o modal e
   protege a saída da página. O treino permanece pausado em memória e pode ser salvo
   no servidor; a interface não promete recuperação que o armazenamento não confirmou.

## Cache, limites e operação

Avaliação usa chave própria por ação/data/atividade, revisão, escritor e expiração de
sete dias, com debounce de 400ms e flush no fechamento/saída. Mudanças em outra aba,
cache inválido, expirado ou revisão antiga bloqueiam gravação até conferência explícita.
Descartar avaliação não apaga a execução. Uma nova retomada troca o snapshot de stop,
preservando os campos da avaliação. LocalStorage não oferece lock atômico entre abas;
a revisão e as validações do servidor permanecem obrigatórias.

A migration deve ser aplicada pelo fluxo normal antes do uso da versão. Rollback de
aplicação pode manter essa alteração compatível; não reintroduzir a constraint antiga
sobre execuções curtas já registradas. O cache novo é isolado do cache de execução e
do editor; os formatos anteriores continuam legíveis.

A validação móvel usa emulação Chromium. Teclado virtual, safe area e interação em
aparelho físico continuam no escopo pendente da E06-T14; não foram declarados concluídos.
Não houve deploy de produção nesta entrega.

## Capturas

- [Treino guiado em 320px](evidence/player-2026-10-28/guided-mobile.png).
- [Registro em modal no celular](evidence/player-2026-10-28/completion-mobile.png).
- [Atividades concluídas no desktop](evidence/player-2026-10-28/completed-desktop.png).
