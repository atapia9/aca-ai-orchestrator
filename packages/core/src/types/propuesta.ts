import { z } from "zod";
import type { Servicio } from "../config/servicios.js";

export const propuestaLlmSchema = z.object({
  markdown: z.string().min(1),
});
export type PropuestaLlm = z.infer<typeof propuestaLlmSchema>;

export const propuestaSchema = propuestaLlmSchema.extend({
  negocioId: z.string(),
  servicioId: z.string(),
});
export type Propuesta = z.infer<typeof propuestaSchema>;

/**
 * Schema de salida del modelo para la propuesta, cerrado sobre el servicio
 * recomendado: si su precio está en estado "hipotesis", exige que el
 * markdown lo marque visiblemente (regla del YAML de servicios, sección 4).
 */
export function crearPropuestaLlmSchema(servicio: Servicio) {
  return propuestaLlmSchema.superRefine((valor, ctx) => {
    if (servicio.estado === "hipotesis" && !/hip[oó]tesis/i.test(valor.markdown)) {
      ctx.addIssue(
        `El servicio "${servicio.nombre}" tiene precio en estado "hipotesis"; la propuesta debe marcarlo visiblemente (incluir la palabra "hipótesis").`,
      );
    }
  });
}
