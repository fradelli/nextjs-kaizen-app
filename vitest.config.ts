import path from "node:path";
import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig } from "vitest/config";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "@": path.join(rootDirectory, "src") },
  },
  test: {
    environment: "jsdom",
    exclude: [
      ...configDefaults.exclude,
      "scripts/validate-governance.test.mjs",
      "scripts/validate-component-structure.test.mjs",
      "scripts/validate-layer-boundaries.test.mjs",
      "scripts/validate-ui-icons.test.mjs",
      "tests/integration/**",
      "src/generated/prisma/**",
    ],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      exclude: ["src/generated/prisma/**", "tests/integration/**"],
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
