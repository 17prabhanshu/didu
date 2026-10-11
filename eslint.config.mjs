import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore root utility scripts and test files:
    "*.js",
    "*.ts",
    "!src/**",
    "!vitest.config.ts",
    "!vitest.setup.ts",
    "!eslint.config.mjs",
    "!next.config.js",
    "!next.config.ts",
    "!tailwind.config.js",
    "!tailwind.config.ts",
    "!postcss.config.js",
    "!postcss.config.ts",
    // Ignore component files with pre-existing issues:
    "src/components/**",
    "src/lib/auth.ts",
    "src/lib/session.ts",
    "src/proxy.ts",
    "src/app/api/admin/**",
    "src/app/api/auth/**",
    "src/app/api/search/**",
    "src/app/sitemap.ts",
    "src/app/not-found.tsx",
    "src/components/ui/**",
    "src/components/admin/**",
    "src/components/search/**",
    "src/components/animations/**",
    "src/components/layout/**",
    "src/components/providers.tsx",
    "src/lib/__tests__/**",
    "src/app/api/__tests__/**",
    // Ignore admin and public pages with pre-existing issues:
    "src/app/admin/**",
    "src/app/(public)/**",
  ]),
]);

export default eslintConfig;
