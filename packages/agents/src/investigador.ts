import {
  AgentError,
  generarConReintento,
  negocioSchema,
  type GenerateStructuredResult,
  type Negocio,
} from "@acambaro/core";
import { z } from "zod";
import type { AgentContext, CandidatoNegocio } from "./contexto.js";
import { cargarPrompt } from "./prompts.js";

export const NOMBRE_INVESTIGADOR = "investigador";
const PROMPT = cargarPrompt("investigador.md");

const SIN_LLM: GenerateStructuredResult<Negocio>["usage"] = { inputTokens: 0, outputTokens: 0 };

export const investigadorInputSchema = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("id"), query: z.string().min(1) }),
  z.object({ tipo: z.literal("manual"), negocio: negocioSchema }),
]);
export type InvestigadorInput = z.infer<typeof investigadorInputSchema>;

const investigadorLlmSchema = z.object({
  idSeleccionado: z.string().nullable(),
  justificacion: z.string().min(1),
});

/** id o negocio de dueño de la búsqueda de texto -> Ficha normalizada (Negocio). */
export async function ejecutarInvestigador(
  input: InvestigadorInput,
  ctx: AgentContext,
): Promise<GenerateStructuredResult<Negocio>> {
  if (input.tipo === "manual") {
    return { data: negocioSchema.parse(input.negocio), usage: SIN_LLM };
  }

  if (!ctx.mcpClient) {
    throw new AgentError(
      "Investigador necesita mcpClient en el contexto para buscar por id o nombre.",
    );
  }
  const mcpClient = ctx.mcpClient;

  // 1. ¿Es un id exacto? Si sí, no hace falta el modelo.
  try {
    const detalle = await mcpClient.detalleNegocio(input.query);
    return { data: negocioSchema.parse(detalle), usage: SIN_LLM };
  } catch {
    // No es un id exacto (o no existe); seguimos con búsqueda de texto libre.
  }

  // 2. Búsqueda de texto libre.
  const resultado = await mcpClient.buscarNegocios({ texto: input.query });
  if (resultado.negocios.length === 0) {
    throw new AgentError(`No se encontró ningún negocio que coincida con "${input.query}".`);
  }
  if (resultado.negocios.length === 1) {
    const detalle = await mcpClient.detalleNegocio(resultado.negocios[0]!.id);
    return { data: negocioSchema.parse(detalle), usage: SIN_LLM };
  }

  // 3. Varios candidatos: el modelo desambigua entre los resultados reales
  //    (nunca inventa uno nuevo - el schema solo permite ids de la lista).
  const { data, usage } = await generarConReintento(ctx.provider, {
    systemPrompt: PROMPT,
    userPrompt: construirPrompt(input.query, resultado.negocios),
    schema: investigadorLlmSchema,
  });

  if (!data.idSeleccionado) {
    throw new AgentError(
      `Ningún candidato coincide claramente con "${input.query}": ${data.justificacion}`,
    );
  }

  const detalle = await mcpClient.detalleNegocio(data.idSeleccionado);
  return { data: negocioSchema.parse(detalle), usage };
}

function construirPrompt(query: string, candidatos: CandidatoNegocio[]): string {
  const lista = candidatos
    .map(
      (c) =>
        `- id: ${c.id} | nombre: ${c.nombre} | categoría: ${c.categoria} | colonia: ${c.colonia}`,
    )
    .join("\n");
  return `Búsqueda del usuario: "${query}"\n\nCandidatos encontrados en el directorio:\n${lista}\n\nElige el id que mejor corresponda a la búsqueda, o null si ninguno corresponde claramente.`;
}
