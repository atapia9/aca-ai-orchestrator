import {
  calcularPuntajeGeneral,
  diagnosticoLlmSchema,
  generarConReintento,
  type Diagnostico,
  type GenerateStructuredResult,
  type Negocio,
} from "@acambaro/core";
import type { AgentContext } from "./contexto.js";
import { cargarPrompt } from "./prompts.js";

export const NOMBRE_DIAGNOSTICO = "diagnostico";
const PROMPT = cargarPrompt("diagnostico.md");

/** Ficha (Negocio) -> Diagnostico: 6 dimensiones puntuadas, verificado/supuesto, 3 quick wins. */
export async function ejecutarDiagnostico(
  negocio: Negocio,
  ctx: AgentContext,
): Promise<GenerateStructuredResult<Diagnostico>> {
  const { data, usage } = await generarConReintento(ctx.provider, {
    systemPrompt: PROMPT,
    userPrompt: construirPrompt(negocio),
    schema: diagnosticoLlmSchema,
  });

  return {
    data: {
      ...data,
      negocioId: negocio.id,
      puntajeGeneral: calcularPuntajeGeneral(data.puntuaciones),
    },
    usage,
  };
}

function construirPrompt(negocio: Negocio): string {
  return `Ficha del negocio (única fuente de datos verificados; todo lo que no aparezca aquí es un supuesto):\n\n${JSON.stringify(negocio, null, 2)}`;
}
