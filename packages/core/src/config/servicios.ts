import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { ConfigError } from "../errors.js";

export const servicioSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  precio_mxn: z.number().nonnegative(),
  estado: z.enum(["confirmado", "hipotesis"]),
  periodicidad: z.enum(["mensual"]).optional(),
});
export type Servicio = z.infer<typeof servicioSchema>;

const escaleraServiciosSchema = z.object({
  servicios: z.array(servicioSchema).min(1),
});

/** Lee y valida config/sdda-servicios.yaml (o la ruta que se le pase). */
export function cargarEscaleraServicios(rutaArchivo: string): Servicio[] {
  let contenido: string;
  try {
    contenido = readFileSync(rutaArchivo, "utf-8");
  } catch (error) {
    throw new ConfigError(`No se pudo leer el archivo de servicios en "${rutaArchivo}".`, {
      cause: error,
    });
  }

  let datos: unknown;
  try {
    datos = parseYaml(contenido);
  } catch (error) {
    throw new ConfigError(`El archivo de servicios en "${rutaArchivo}" no es YAML válido.`, {
      cause: error,
    });
  }

  const resultado = escaleraServiciosSchema.safeParse(datos);
  if (!resultado.success) {
    throw new ConfigError(
      `El archivo de servicios en "${rutaArchivo}" no tiene el esquema esperado:\n${resultado.error.message}`,
    );
  }
  return resultado.data.servicios;
}

export function buscarServicio(servicios: Servicio[], id: string): Servicio | undefined {
  return servicios.find((servicio) => servicio.id === id);
}
