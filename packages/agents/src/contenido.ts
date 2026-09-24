import {
  generarConReintento,
  publicacionesLlmSchema,
  type Diagnostico,
  type GenerateStructuredResult,
  type Negocio,
  type Publicaciones,
} from "@acambaro/core";
import type { AgentContext } from "./contexto.js";
import { cargarPrompt } from "./prompts.js";

export const NOMBRE_CONTENIDO = "contenido";
const PROMPT = cargarPrompt("contenido.md");

export interface ContenidoInput {
  negocio: Negocio;
  diagnostico: Diagnostico;
}

/** Ficha + Diagnostico -> 3 publicaciones (Facebook, Instagram, WhatsApp Status). */
export async function ejecutarContenido(
  input: ContenidoInput,
  ctx: AgentContext,
): Promise<GenerateStructuredResult<Publicaciones>> {
  return generarConReintento(ctx.provider, {
    systemPrompt: PROMPT,
    userPrompt: construirPrompt(input),
    schema: publicacionesLlmSchema,
  });
}

function construirPrompt({ negocio, diagnostico }: ContenidoInput): string {
  return [
    "Ficha del negocio:",
    JSON.stringify(negocio, null, 2),
    "",
    "Diagnóstico de presencia digital:",
    JSON.stringify(diagnostico, null, 2),
  ].join("\n");
}
