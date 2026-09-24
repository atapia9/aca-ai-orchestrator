import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // El test de integracion levanta el servidor real por stdio; puede tardar
    // un poco mas que una prueba unitaria comun.
    testTimeout: 15000,
  },
});
