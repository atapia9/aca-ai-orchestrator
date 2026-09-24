import { z } from "zod";

export const DIAS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"] as const;
export const diaSchema = z.enum(DIAS);
export type Dia = (typeof DIAS)[number];

export const negocioResumenSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  categoria: z.string(),
  colonia: z.string(),
  abierto_ahora: z.boolean(),
});
export type NegocioResumen = z.infer<typeof negocioResumenSchema>;

export const negocioDetalleSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  categoria: z.string(),
  descripcion: z.string(),
  direccion: z.string(),
  colonia: z.string(),
  telefono: z.string().optional(),
  whatsapp: z.string().optional(),
  sitio_web: z.string().optional(),
  redes: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      google_maps: z.string().optional(),
    })
    .optional(),
  horario: z.record(z.string(), z.array(z.string())),
  etiquetas: z.array(z.string()),
  actualizado: z.string(),
  abierto_ahora: z.boolean(),
});
export type NegocioDetalle = z.infer<typeof negocioDetalleSchema>;

export const busquedaResultadoSchema = z.object({
  total: z.number(),
  negocios: z.array(negocioResumenSchema),
});
export type BusquedaResultado = z.infer<typeof busquedaResultadoSchema>;

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
