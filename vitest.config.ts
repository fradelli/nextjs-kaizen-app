import path from "node:path";
import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig } from "vitest/config";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "@": path.join(rootDirectory, "src") },
  },
  test: {
    exclude: [
      ...configDefaults.exclude,
      "scripts/validate-governance.test.mjs",
      "scripts/validate-component-structure.test.mjs",
      "scripts/validate-layer-boundaries.test.mjs",
      "scripts/validate-ui-icons.test.mjs",
      "scripts/validate-doc-catalog.test.mjs",
      "scripts/validate-doc-links.test.mjs",
      "scripts/verify-doc-preservation.test.mjs",
      "tests/integration/**",
      "src/generated/prisma/**",
    ],
    // Domain, application, data and scripts run in Node; only UI tests pay for jsdom.
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.test.ts", "tests/**/*.test.ts", "prisma/**/*.test.ts"],
          exclude: ["src/features/*/ui/**"],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["src/**/*.test.tsx", "tests/**/*.test.tsx", "src/features/*/ui/**/*.test.ts"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/generated/prisma/**", "src/**/*.test.{ts,tsx}", "src/**/*.types.ts"],
      reporter: ["text", "json", "html"],
      // Floor measured over all of src/ in E00-T16. Data and app layers are exercised by the
      // integration suite, which does not report coverage yet; raise these as that gap closes.
      thresholds: {
        lines: 61,
        functions: 60,
        branches: 57,
        statements: 59,
      },
    },
  },
});
