#!/usr/bin/env node
import "dotenv/config";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AnthropicProvider,
  ProveedorDemo,
  cargarEnv,
  cargarEscaleraServicios,
  negocioSchema,
  type Negocio,
} from "@acambaro/core";
import { ejecutarDiagnosticoExpres } from "@acambaro/orchestrator";
import { evaluarCorrida } from "./criterios.js";

const RAIZ_MONOREPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function cargarCasos(): Negocio[] {
  const dirCasos = join(RAIZ_MONOREPO, "evals", "casos");
  return readdirSync(dirCasos)
    .filter((archivo) => archivo.endsWith(".json"))
    .sort()
    .map((archivo) =>
      negocioSchema.parse(JSON.parse(readFileSync(join(dirCasos, archivo), "utf-8"))),
    );
}

async function main(): Promise<void> {
  const modoLive = process.argv.includes("--live");
  const env = cargarEnv();
  const servicios = cargarEscaleraServicios(join(RAIZ_MONOREPO, "config", "sdda-servicios.yaml"));
  const casos = cargarCasos();

  console.log(
    `Corriendo ${casos.length} casos en modo ${modoLive ? "--live (API real de Anthropic)" : "mock"}...\n`,
  );

  let todosPasaron = true;
  for (const negocio of casos) {
    const outputDir = mkdtempSync(join(tmpdir(), `eval-${negocio.id}-`));
    const provider = modoLive
      ? new AnthropicProvider({ model: env.ANTHROPIC_MODEL, apiKey: env.ANTHROPIC_API_KEY })
      : new ProveedorDemo(negocio.nombre);

    console.log(`## ${negocio.nombre} (${negocio.categoria})`);
    try {
      const resultado = await ejecutarDiagnosticoExpres({
        outputDir,
        provider,
        servicios,
        maxUsdPerRun: env.MAX_USD_PER_RUN,
        auto: true,
        dryRun: !modoLive,
        manualNegocio: negocio,
        aprobar: async () => ({ tipo: "si" }),
      });

      if (modoLive) {
        console.log(
          `   costo: $${resultado.resumen.costoTotalUsd.toFixed(4)} USD · salida: ${outputDir}`,
        );
      }

      for (const criterio of evaluarCorrida(resultado, servicios)) {
        console.log(
          `  ${criterio.paso ? "✓" : "✗"} ${criterio.nombre}${criterio.detalle ? ` (${criterio.detalle})` : ""}`,
        );
        if (!criterio.paso) todosPasaron = false;
      }
    } catch (error) {
      todosPasaron = false;
      console.log(
        `  ✗ La corrida lanzó un error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    console.log("");
  }

  console.log(
    todosPasaron ? "✓ Todos los casos pasaron." : "✗ Algún caso falló - revisa el detalle arriba.",
  );
  process.exitCode = todosPasaron ? 0 : 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
