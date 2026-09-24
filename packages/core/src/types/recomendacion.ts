import { z } from "zod";
import { servicioSchema } from "../config/servicios.js";

/** Lo que debe producir el modelo. servicioId se valida contra la escalera real en el agente (Estratega). */
export const recomendacionLlmSchema = z.object({
  servicioId: z.string().min(1),
  justificacion: z.string().min(1),
});
export type RecomendacionLlm = z.infer<typeof recomendacionLlmSchema>;

export const recomendacionSchema = z.object({
  negocioId: z.string(),
  servicio: servicioSchema,
  justificacion: z.string().min(1),
});
export type Recomendacion = z.infer<typeof recomendacionSchema>;
