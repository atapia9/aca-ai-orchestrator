#!/usr/bin/env node
import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  AnthropicProvider,
  ProveedorDemo,
  cargarEnv,
  cargarEscaleraServicios,
  negocioSchema,
  type Negocio,
} from "@acambaro/core";
import { DirectorioClient } from "@acambaro/mcp-client";
import { cargarEstado, ejecutarDiagnosticoExpres, existeEstado } from "@acambaro/orchestrator";
import { aprobarInteractivo } from "./aprobacion.js";
import { parsearArgumentos } from "./argumentos.js";
import { fechaHoy, slugify } from "./slug.js";

async function main(): Promise<void> {
  const opciones = parsearArgumentos(process.argv.slice(2));
  const env = cargarEnv();
  const servicios = cargarEscaleraServicios(join(process.cwd(), "config", "sdda-servicios.yaml"));

  const outputDir = opciones.resume
    ? resolverCarpetaResume(opciones.resume)
    : nuevaCarpetaSalida(opciones);
  if (opciones.resume && !existeEstado(outputDir)) {
    throw new Error(
      `No hay una corrida en "${outputDir}" para reanudar (no se encontró state.json).`,
    );
  }

  const manualNegocio = opciones.manual ? cargarNegocioManual(opciones.manual) : undefined;
  // Al reanudar, --negocio no se vuelve a pasar: si el investigador todavía no
  // corría (o corría con búsqueda de texto vía MCP), la consulta original solo
  // vive en el state.json ya persistido.
  const negocioQuery =
    opciones.negocio ?? (opciones.resume ? cargarEstado(outputDir).negocioQuery : undefined);

  let mcpClient: DirectorioClient | undefined;
  if (negocioQuery && !manualNegocio) {
    mcpClient = await DirectorioClient.connect();
  }

  const provider = opciones.dryRun
    ? new ProveedorDemo(manualNegocio?.nombre)
    : new AnthropicProvider({ model: env.ANTHROPIC_MODEL, apiKey: env.ANTHROPIC_API_KEY });

  try {
    const resultado = await ejecutarDiagnosticoExpres({
      outputDir,
      provider,
      servicios,
      maxUsdPerRun: env.MAX_USD_PER_RUN,
      auto: opciones.auto,
      dryRun: opciones.dryRun,
      mcpClient,
      negocioQuery,
      manualNegocio,
      resume: Boolean(opciones.resume),
      aprobar: aprobarInteractivo,
    });

    console.log(`\nSalida en: ${outputDir}`);
    if (!resultado.completo) {
      console.log(
        "Corrida detenida sin aprobar la recomendación. Vuelve a correr con --resume para continuar.",
      );
      return;
    }

    console.log(`Duración: ${(resultado.resumen.duracionMs / 1000).toFixed(1)}s`);
    console.log(`Costo estimado: $${resultado.resumen.costoTotalUsd.toFixed(4)} USD`);
    for (const [agente, uso] of Object.entries(resultado.resumen.porAgente)) {
      console.log(
        `  ${agente}: ${uso.inputTokens} in / ${uso.outputTokens} out ($${uso.costoUsd.toFixed(4)} USD)`,
      );
    }
  } finally {
    await mcpClient?.close();
  }
}

function nuevaCarpetaSalida(opciones: ReturnType<typeof parsearArgumentos>): string {
  const query = opciones.manual ?? opciones.negocio ?? "negocio";
  const base = opciones.manual
    ? query
        .replace(/\.json$/i, "")
        .split("/")
        .pop()!
    : query;
  return join(process.cwd(), "output", `${fechaHoy()}-${slugify(base)}`);
}

function resolverCarpetaResume(carpeta: string): string {
  if (existsSync(carpeta)) return carpeta;
  const conPrefijo = join(process.cwd(), "output", carpeta);
  if (existsSync(conPrefijo)) return conPrefijo;
  return join(process.cwd(), carpeta);
}

function cargarNegocioManual(ruta: string): Negocio {
  let contenido: string;
  try {
    contenido = readFileSync(ruta, "utf-8");
  } catch (error) {
    throw new Error(
      `No se pudo leer "${ruta}": ${error instanceof Error ? error.message : error}`,
      {
        cause: error,
      },
    );
  }
  const datos: unknown = JSON.parse(contenido);
  const resultado = negocioSchema.safeParse(datos);
  if (!resultado.success) {
    throw new Error(
      `"${ruta}" no tiene el formato de Negocio esperado:\n${resultado.error.message}`,
    );
  }
  return resultado.data;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
