import { defineConfig } from "vitest/config";

// Vitest 5 elimino defineWorkspace/vitest.workspace.ts en favor de
// test.projects. Cada paquete sigue trayendo su propio vitest.config.ts;
// esto solo los agrupa para poder correr `pnpm test` una vez desde la raiz.
export default defineConfig({
  test: {
    projects: ["apps/*", "packages/*"],
  },
});
