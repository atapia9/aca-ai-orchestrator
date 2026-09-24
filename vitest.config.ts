import { defineConfig } from "vitest/config";

// Placeholder hasta la Fase 2: sin paquetes todavia no hay nada que correr.
// Cuando packages/mcp-directorio (u otro paquete) traiga su propio
// vitest.config.ts, este archivo se convierte en vitest.workspace.ts
// (defineWorkspace(["apps/*", "packages/*"])) para agruparlos.
export default defineConfig({
  test: {
    environment: "node",
    passWithNoTests: true,
  },
});
