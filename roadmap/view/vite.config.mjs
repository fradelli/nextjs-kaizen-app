import tailwindcss from "@tailwindcss/postcss";
import { fileURLToPath } from "node:url";

// Build da visualização local do roadmap com @fradelli/ui.
// Saída em roadmap/view/dist, aberta direto do disco (file://): por isso o bundle é um IIFE
// clássico, sem `type="module"`, e os caminhos são relativos.
const root = fileURLToPath(new URL(".", import.meta.url));

function classicScripts() {
  return {
    name: "kaizen-roadmap-classic-scripts",
    enforce: "post",
    transformIndexHtml(html) {
      return html
        .replace(/<script type="module" crossorigin src=/g, "<script defer src=")
        .replace(/<link rel="stylesheet" crossorigin href=/g, '<link rel="stylesheet" href=');
    },
  };
}

const config = {
  root,
  base: "./",
  cacheDir: fileURLToPath(new URL("./.vite-cache", import.meta.url)),
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [classicScripts()],
  build: {
    outDir: fileURLToPath(new URL("./dist", import.meta.url)),
    emptyOutDir: true,
    assetsInlineLimit: 0,
    // Um único bundle local (React + @fradelli/ui); não há rede para dividir em pedaços.
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        format: "iife",
        entryFileNames: "assets/roadmap.js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
};

export default config;
