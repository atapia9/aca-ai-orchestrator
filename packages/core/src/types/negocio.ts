import { z } from "zod";

export const DIAS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"] as const;
export const diaSchema = z.enum(DIAS);
export type Dia = (typeof DIAS)[number];

export const redesSchema = z.object({
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  google_maps: z.string().optional(),
});
export type Redes = z.infer<typeof redesSchema>;

/**
 * Ficha normalizada de un negocio. Mismo shape que expone mcp-directorio
 * (packages/mcp-client la extiende con abierto_ahora, que es un dato
 * derivado de la hora de consulta, no un hecho propio del negocio).
 * `ficticio` es obligatorio-marcar en true para negocios de samples/
 * (regla de datos de la sección 5) - ausente/false para datos reales del
 * directorio.
 */
export const negocioSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  categoria: z.string(),
  descripcion: z.string(),
  direccion: z.string(),
  colonia: z.string(),
  telefono: z.string().optional(),
  whatsapp: z.string().optional(),
  sitio_web: z.string().optional(),
  redes: redesSchema.optional(),
  // string, no diaSchema: en zod v4 z.record(enum, ...) exige TODAS las
  // claves del enum (una asignacion completa), y un negocio puede
  // legitimamente no tener entrada para un dia que no abre.
  horario: z.record(z.string(), z.array(z.string())),
  etiquetas: z.array(z.string()),
  actualizado: z.string(),
  ficticio: z.boolean().optional(),
});
export type Negocio = z.infer<typeof negocioSchema>;
