# Análise do catálogo completo da Phosphor

Análise de 27/10/2026. Sem alterações em componentes, dependências ou no Design System.
Experimento local com Phosphor 2.1.10, esbuild 0.28.2, ESM minificado, React externo.
Dois ícones: TrashIcon e PlusIcon. Os resultados abaixo não são o bundle do Next.js.

## Conclusão

Disponibilizar todo o catálogo é viável. Recomenda-se uma API pública por ícone,
com geração automática do catálogo e uma entrada agregada para compatibilidade.
Não restringir o DS aos 11 símbolos necessários hoje; não criar um registro dinâmico
com todos os ícones em tempo de execução.

## Medição reproduzível em fixture isolada

| Caso | JavaScript minificado | Gzip | Módulos analisados | Usa React Context |
|---|---:|---:|---:|---|
| public-per-icon | 4,443 bytes | 1,284 bytes | 8 | Não |
| individual-ssr | 4,443 bytes | 1,285 bytes | 6 | Não |
| catalog-ssr-named | 4,443 bytes | 1,278 bytes | 3,028 | Não |
| catalog-csr-named | 4,626 bytes | 1,342 bytes | 4,542 | Sim |
| catalog-ssr-dynamic | 4,939,479 bytes | 1,075,044 bytes | 3,027 | Não |

- individual-ssr importa os dois arquivos ESM SSR diretamente.
- public-per-icon passa por dois módulos públicos separados que reexportam os mesmos ícones.
- catalog-ssr-named passa por um barrel exportando toda a entrada SSR, mas usa imports nomeados.
- catalog-csr-named usa a entrada ESM padrão, que utiliza Context e não é a escolha para RSC.
- catalog-ssr-dynamic exporta uma função de consulta por nome em um namespace completo.

O catálogo SSR com imports nomeados terminou nos mesmos 4.443 bytes do acesso individual.
Isso demonstra tree shaking nesse experimento, mas o grafo cresceu de 6 para 3.028 módulos.
Com módulos públicos por ícone foram 8 módulos, preservando os mesmos 4.443 bytes.
Consulta dinâmica reteve cerca de 4,94 MB minificados (1,08 MB gzip).

Tempos de execuções isoladas variaram com caches/aquecimento. Não são benchmark de
latência do usuário nem justificam afirmar uma razão fixa de desempenho.

## Evidência técnica local

- A dependência declara sideEffects:false e entradas ESM para root, ssr e cada ícone.
- Foram encontrados 1.512 módulos de ícones SSR nesta versão instalada, sem contar index.
- Cada desenho aceita seis weights; isso não equivale a importar um catálogo separado por weight.
- SSRBase não usa useContext; IconBase de CSR usa o contexto da Phosphor.
- O README instalado recomenda SSR para Server Components, menciona tree shaking e
  alerta para custo de compilar o catálogo durante desenvolvimento e namespace imports.
- O catálogo SSR também expõe SSRBase e aliases. Exportar tudo cegamente amplia a API
  além de desenhos; o gerador proposto deve publicar componentes Icon e tipos decididos.
- Next instalado não inclui @fradelli/ui/icons em sua lista padrão de optimizePackageImports.
  Otimização da Phosphor não deve ser assumida para uma fachada com outro nome.
- A validação atual de tarball do Design System tem allowlist explícita e tenta ler
  targets como caminhos literais. Novos módulos/wildcards exigem atualizar esse gate.

## Contrato recomendado

```tsx
import { TrashIcon } from "@fradelli/ui/icons/Trash";
import { PlusIcon } from "@fradelli/ui/icons/Plus";
```

Esses subpaths são **propostos**, ainda não publicados. O consumidor só poderá usá-los
quando o DS tiver export map, artefatos, declarações e release verificados.

- API por desenho evita que cada consumidor processe o catálogo agregado para usar um ícone.
- Entrada atual @fradelli/ui/icons permanece compatível para BarbellIcon/ForkKnifeIcon/IconProps.
- Pode oferecer o catálogo completo também no agregado, com exports gerados e nomeados;
  a recomendação de consumo de Next continua sendo o subpath por ícone.
- Todo catálogo refere-se à versão fixada da Phosphor. Ícone que só existir numa versão
  futura requer upgrade/release do DS; não há atualização flutuante por nome.
- Não publicar IconContext na entrada SSR nem adicionar use client ao catálogo.
- Não introduzir Icon name=string ou export const icons com todos os componentes.
- Não depender de uma opção experimental do Next para manter imports pequenos.

## Gates antes de publicar

1. Preservar assinatura de IconProps e os dois exports existentes; conferir tipos/ref.
2. Gerar componentes/entradas por ícone e export map público, sem editar 1.512 arquivos à mão.
3. Manifesto versionado: componentes exportados correspondem ao catálogo da dependência fixa.
4. Atualizar allowlist/expansão de targets no validate-package.mjs; nenhum glob pode
   simplesmente autorizar qualquer arquivo novo no tarball.
5. Testar um ícone antigo e um novo em Server Component e Client Component de Next.
6. Testar artefato instalado via npm e pnpm e resolução NodeNext das declarações.
7. Medir dev frio, HMR, build e JS de cliente com 2 e 20 ícones, verificando contribuição
   dos módulos, sem confundir módulos analisados com bytes enviados ao navegador.
8. Confirmar que módulos não utilizados não aparecem no bundle de cliente e que
   importar um ícone não inclui o catálogo inteiro nem React Context por acidente.
9. Gates do DS, Changeset minor compatível e Release oficial. O patch do Kaizen vem depois.

A medição com esbuild é evidência de viabilidade; não substitui esses testes de Next
ou garante comportamento de todos os bundlers. Nenhum gate futuro foi declarado executado.
