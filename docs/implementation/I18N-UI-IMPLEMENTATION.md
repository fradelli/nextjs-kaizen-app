# Internacionalização da interface

Implementada em 29/10/2026, com autorização para antecipar a interface em relação ao roadmap anterior. A tradução do catálogo de exercícios será integrada ao catálogo novo em desenvolvimento.

## Comportamento

- Idiomas: `en` e `pt-BR`. Variantes inglesas e portuguesas são normalizadas.
- A preferência explícita válida do cookie `kaizen_locale` precede `Accept-Language`; sem preferência compatível, usar inglês.
- A detecção automática não cria cookie. Assim, uma mudança na preferência do navegador é respeitada na próxima requisição.
- A aplicação não consulta diretamente o idioma do sistema operacional: usa a preferência que o navegador envia.
- O HTML inicial, o provider do cliente e os metadados usam o mesmo locale da requisição.
- Rotas existentes continuam válidas; idioma não muda IDs, códigos de formulário, kg, datas civis ou fuso de negócio.
- Não foi adicionado seletor manual; a experiência solicitada é automática. O suporte de leitura do cookie permite integrar uma preferência explícita posteriormente.

## Organização

[`src/i18n/request.ts`](../../src/i18n/request.ts) configura o next-intl por requisição. [`locale.ts`](../../src/i18n/locale.ts) negocia prioridades, variantes e fallback. Os catálogos [`en.json`](../../messages/en.json) e [`pt-BR.json`](../../messages/pt-BR.json) fornecem 290 mensagens cada, com chaves semânticas, parâmetros e pluralização. As chaves são tipadas por declaração de `AppConfig`.

Componentes usam `useTranslations`; componentes assíncronos usam `getTranslations`. Utilitários de apresentação recebem locale explicitamente. As datas civis são formatadas a partir de meia-noite UTC para conservar o dia; a resolução do dia do treino mantém America/Sao_Paulo.

Os códigos internos dos selects permanecem iguais. O campo numérico nativo mantém sua semântica de entrada e serialização; não houve migração de números para strings localizadas. Não foram alteradas cargas ou regras de medição.

Os DTOs de exercício agora incluem opcionalmente o bloco estruturado, permitindo traduzir “Bloco/Block” na UI sem interpretar texto persistido ou alterar as regras de alternância. O rótulo legado permanece por compatibilidade.

As mutações existentes ainda devolvem mensagens textuais. [`localize-training-feedback.ts`](../../src/features/training/ui/localize-training-feedback.ts) e seu mapa explícito adaptam esse contrato na apresentação, sem traduzir conteúdo livre. Mensagens conhecidas recebem tradução; erros desconhecidos em inglês recebem orientação genérica. Não adicionar tradução de mensagens por heurística ou chamadas externas. Uma futura evolução do contrato poderá substituir o mapa por códigos de erro estáveis.

## Limites deliberados

- Nomes de exercícios, sessões, prescrições, instruções e demais textos editoriais dos planos permanecem na origem atual. Sua localização pertence à integração do catálogo novo, preservando versões e histórico.
- Nomes e comentários digitados pelo usuário são preservados no idioma original.
- Alimentação possui atualmente uma tela de preparação, que foi traduzida. Não foram criadas jornadas alimentares inexistentes.
- `/foundations` é a vitrine técnica do design system e não participa do catálogo de mensagens de produto nesta entrega.
- A entrega exige paridade completa dos catálogos. Não há tradução automática nem preenchimento silencioso de chaves ausentes; o CI rejeita chaves ou parâmetros incompatíveis. Idiomas não suportados usam o catálogo inglês completo.

## Validação e manutenção

`pnpm i18n:check` verifica paridade de chaves, parâmetros, sintaxe ICU e rótulos fixos no JSX das superfícies do produto. A marca japonesa é uma exceção explícita. Esse comando faz parte de `pnpm run ci`, e os catálogos fazem parte do format check.

Ao adicionar texto, criar a chave nos dois catálogos, conservar os mesmos parâmetros e consumir a tradução na apresentação. O verificador de JSX não substitui revisão de constantes, templates ou textos vindos de contratos de dados.

Evidências executadas:

- 408 testes unitários/componentes passaram em 58 arquivos, incluindo negociação, configuração por requisição, interface em ambos os idiomas, pluralização e compatibilidade de erros.
- Build de produção, TypeScript, lint e validações de estrutura, fronteiras, ícones e dados passaram.
- Seis requisições ao servidor de produção local confirmaram HTML, metadados e conteúdo em inglês/português, fallback para francês e override válido por cookie. As requisições alternaram idiomas para detectar compartilhamento indevido de resposta.
- O primeiro teste completo concorrente ao build excedeu o tempo no carregamento de snapshots Git. A repetição com dois workers passou integralmente; nenhum timeout foi ampliado.

Para repetir a verificação HTTP, iniciar a versão compilada na porta 3100 e executar `node scripts/test-i18n-http.mjs`. O teste usa alimentação e data inválida de treino, dispensando mutações e conexão ao banco. Essa evidência não substitui uma jornada manual com o catálogo novo.

Não houve migration, reimportação de planos ou alteração de dados persistidos nesta entrega. Rollback da interface consiste em reverter a integração e os consumidores de tradução em conjunto; o banco não exige rollback.
