import {
  crearPropuestaLlmSchema,
  generarConReintento,
  type Diagnostico,
  type GenerateStructuredResult,
  type Negocio,
  type Propuesta,
  type Publicaciones,
  type Recomendacion,
} from "@acambaro/core";
import type { AgentContext } from "./contexto.js";
import { cargarPrompt } from "./prompts.js";

export const NOMBRE_PROPUESTA = "propuesta";
const PROMPT = cargarPrompt("propuesta.md");

export interface PropuestaInput {
  negocio: Negocio;
  diagnostico: Diagnostico;
  recomendacion: Recomendacion;
  publicaciones: Publicaciones;
}

/** Todo lo anterior -> Propuesta comercial en Markdown. */
export async function ejecutarPropuesta(
  input: PropuestaInput,
  ctx: AgentContext,
): Promise<GenerateStructuredResult<Propuesta>> {
  const schema = crearPropuestaLlmSchema(input.recomendacion.servicio);

  const { data, usage } = await generarConReintento(ctx.provider, {
    systemPrompt: PROMPT,
    userPrompt: construirPrompt(input),
    schema,
  });

  return {
    data: {
      markdown: data.markdown,
      negocioId: input.negocio.id,
      servicioId: input.recomendacion.servicio.id,
    },
    usage,
  };
}

function construirPrompt({
  negocio,
  diagnostico,
  recomendacion,
  publicaciones,
}: PropuestaInput): string {
  return [
    "Ficha del negocio:",
    JSON.stringify(negocio, null, 2),
    "",
    "Diagnóstico de presencia digital:",
    JSON.stringify(diagnostico, null, 2),
    "",
    "Servicio recomendado y justificación:",
    JSON.stringify(recomendacion, null, 2),
    "",
    "Publicaciones de contenido ya generadas (para referencia, no las repitas literalmente):",
    JSON.stringify(publicaciones, null, 2),
  ].join("\n");
}
