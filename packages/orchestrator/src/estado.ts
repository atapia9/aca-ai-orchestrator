import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ConfigError,
  diagnosticoSchema,
  negocioSchema,
  propuestaSchema,
  publicacionesLlmSchema,
  recomendacionSchema,
} from "@acambaro/core";
import { z } from "zod";

const usageSchema = z.object({ inputTokens: z.number(), outputTokens: z.number() });

function pasoSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({ completedAt: z.string(), usage: usageSchema, data: dataSchema });
}

export const runStateSchema = z.object({
  version: z.literal(1),
  negocioQuery: z.string().optional(),
  manualPath: z.string().optional(),
  auto: z.boolean(),
  dryRun: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  steps: z.object({
    investigador: pasoSchema(negocioSchema).optional(),
    diagnostico: pasoSchema(diagnosticoSchema).optional(),
    estratega: pasoSchema(recomendacionSchema).optional(),
    contenido: pasoSchema(publicacionesLlmSchema).optional(),
    aprobado: z.boolean().optional(),
    propuesta: pasoSchema(propuestaSchema).optional(),
  }),
});
export type RunState = z.infer<typeof runStateSchema>;

export interface CrearEstadoOpciones {
  negocioQuery?: string;
  manualPath?: string;
  auto: boolean;
  dryRun: boolean;
}

export function crearEstado(opciones: CrearEstadoOpciones): RunState {
  const ahora = new Date().toISOString();
  return {
    version: 1,
    negocioQuery: opciones.negocioQuery,
    manualPath: opciones.manualPath,
    auto: opciones.auto,
    dryRun: opciones.dryRun,
    createdAt: ahora,
    updatedAt: ahora,
    steps: {},
  };
}

const NOMBRE_ARCHIVO_ESTADO = "state.json";

export function rutaEstado(directorio: string): string {
  return join(directorio, NOMBRE_ARCHIVO_ESTADO);
}

export function cargarEstado(directorio: string): RunState {
  const ruta = rutaEstado(directorio);
  let contenido: string;
  try {
    contenido = readFileSync(ruta, "utf-8");
  } catch (error) {
    throw new ConfigError(
      `No se pudo leer el estado en "${ruta}". ¿La carpeta de --resume es correcta?`,
      {
        cause: error,
      },
    );
  }
  const datos: unknown = JSON.parse(contenido);
  const resultado = runStateSchema.safeParse(datos);
  if (!resultado.success) {
    throw new ConfigError(
      `El estado en "${ruta}" no tiene el formato esperado:\n${resultado.error.message}`,
    );
  }
  return resultado.data;
}

export function guardarEstado(directorio: string, estado: RunState): void {
  mkdirSync(directorio, { recursive: true });
  const actualizado: RunState = { ...estado, updatedAt: new Date().toISOString() };
  writeFileSync(rutaEstado(directorio), JSON.stringify(actualizado, null, 2), "utf-8");
}

export function existeEstado(directorio: string): boolean {
  return existsSync(rutaEstado(directorio));
}
