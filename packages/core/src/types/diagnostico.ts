import { z } from "zod";

/**
 * Nota: esto es distinto de la tool `diagnostico_digital` que ya expone
 * mcp-directorio (reglas fijas sobre 6 factores booleanos, sin LLM). Este
 * Diagnostico es la salida del agente 2 del orquestador: 6 dimensiones
 * puntuadas por el modelo a partir de la Ficha, distinguiendo
 * explícitamente datos verificados de supuestos (regla de datos, sección 5).
 */
export const DIMENSIONES_DIAGNOSTICO = [
  "web",
  "redes_sociales",
  "google_business",
  "resenas",
  "whatsapp_contacto",
  "contenido",
] as const;
export const dimensionDiagnosticoSchema = z.enum(DIMENSIONES_DIAGNOSTICO);
export type DimensionDiagnostico = (typeof DIMENSIONES_DIAGNOSTICO)[number];

export const puntuacionDimensionSchema = z.object({
  dimension: dimensionDiagnosticoSchema,
  puntaje: z.number().min(0).max(100),
  justificacion: z.string().min(1),
});
export type PuntuacionDimension = z.infer<typeof puntuacionDimensionSchema>;

/** Lo que debe producir el modelo (sin negocioId ni puntajeGeneral: esos los agrega el agente). */
export const diagnosticoLlmSchema = z.object({
  puntuaciones: z.array(puntuacionDimensionSchema).length(DIMENSIONES_DIAGNOSTICO.length),
  datosVerificados: z.array(z.string().min(1)).min(1),
  supuestos: z.array(z.string().min(1)),
  quickWins: z.array(z.string().min(1)).length(3),
});
export type DiagnosticoLlm = z.infer<typeof diagnosticoLlmSchema>;

export const diagnosticoSchema = diagnosticoLlmSchema.extend({
  negocioId: z.string(),
  puntajeGeneral: z.number().min(0).max(100),
});
export type Diagnostico = z.infer<typeof diagnosticoSchema>;

/** Promedio de las 6 dimensiones. Se calcula en codigo, nunca se le pide al modelo. */
export function calcularPuntajeGeneral(puntuaciones: PuntuacionDimension[]): number {
  const suma = puntuaciones.reduce((total, p) => total + p.puntaje, 0);
  return Math.round(suma / puntuaciones.length);
}
