import { negocioSchema, type Dia } from "@acambaro/core";
import { z } from "zod";

export type { Dia };

export const negocioResumenSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  categoria: z.string(),
  colonia: z.string(),
  abierto_ahora: z.boolean(),
});
export type NegocioResumen = z.infer<typeof negocioResumenSchema>;

/** El shape de Negocio (@acambaro/core) más abierto_ahora, que es un dato
 * derivado de la hora de la consulta, no un hecho propio del negocio. */
export const negocioDetalleSchema = negocioSchema.extend({
  abierto_ahora: z.boolean(),
});
export type NegocioDetalle = z.infer<typeof negocioDetalleSchema>;

export const busquedaResultadoSchema = z.object({
  total: z.number(),
  negocios: z.array(negocioResumenSchema),
});
export type BusquedaResultado = z.infer<typeof busquedaResultadoSchema>;

/**
 * Nota: esta es la tool `diagnostico_digital` del propio mcp-directorio
 * (reglas fijas sobre 6 factores booleanos, sin LLM) - distinta del
 * `Diagnostico` de @acambaro/core, que es la salida del agente 2 del
 * orquestador (6 dimensiones puntuadas por el modelo).
 */
export const diagnosticoDigitalSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  puntaje: z.number(),
  nivel: z.enum(["bajo", "medio", "alto"]),
  factores: z.array(
    z.object({
      nombre: z.string(),
      cumplido: z.boolean(),
      puntos: z.number(),
    }),
  ),
  servicio_sugerido: z.string(),
});
export type DiagnosticoDigital = z.infer<typeof diagnosticoDigitalSchema>;

export const categoriaSchema = z.object({
  categoria: z.string(),
  total: z.number(),
});
export type Categoria = z.infer<typeof categoriaSchema>;
