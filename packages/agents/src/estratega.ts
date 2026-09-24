import {
  AgentError,
  buscarServicio,
  generarConReintento,
  recomendacionLlmSchema,
  type Diagnostico,
  type GenerateStructuredResult,
  type Recomendacion,
  type Servicio,
} from "@acambaro/core";
import type { AgentContext } from "./contexto.js";
import { cargarPrompt } from "./prompts.js";

export const NOMBRE_ESTRATEGA = "estratega";
const PROMPT = cargarPrompt("estratega.md");

/** Diagnostico + escalera de servicios (ctx.servicios) -> Recomendacion. */
export async function ejecutarEstratega(
  diagnostico: Diagnostico,
  ctx: AgentContext,
): Promise<GenerateStructuredResult<Recomendacion>> {
  if (!ctx.servicios || ctx.servicios.length === 0) {
    throw new AgentError(
      "Estratega necesita la escalera de servicios (ctx.servicios) para recomendar.",
    );
  }
  const servicios = ctx.servicios;

  // El servicioId debe existir en la escalera real - se valida como parte
  // del mismo schema para que generarConReintento lo trate igual que
  // cualquier otro fallo de validación (reintento con el error, luego error controlado).
  const idsValidos = new Set(servicios.map((s) => s.id));
  const schema = recomendacionLlmSchema.refine(
    (valor) => idsValidos.has(valor.servicioId),
    `servicioId debe ser uno de: ${[...idsValidos].join(", ")}`,
  );

  const { data, usage } = await generarConReintento(ctx.provider, {
    systemPrompt: PROMPT,
    userPrompt: construirPrompt(diagnostico, servicios),
    schema,
  });

  // Ya validado por el refine de arriba: buscarServicio no puede regresar undefined aquí.
  const servicio = buscarServicio(servicios, data.servicioId) as Servicio;

  return {
    data: { negocioId: diagnostico.negocioId, servicio, justificacion: data.justificacion },
    usage,
  };
}

function construirPrompt(diagnostico: Diagnostico, servicios: Servicio[]): string {
  return [
    `Diagnóstico (puntaje general ${diagnostico.puntajeGeneral}/100):`,
    JSON.stringify(diagnostico, null, 2),
    "",
    "Escalera de servicios SDDA disponible:",
    JSON.stringify(servicios, null, 2),
  ].join("\n");
}
