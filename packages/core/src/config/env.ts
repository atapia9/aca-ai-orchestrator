import { z } from "zod";
import { ConfigError } from "../errors.js";

const envSchema = z.object({
  // .env.example trae ANTHROPIC_API_KEY= (vacío) a propósito para --dry-run;
  // dotenv la carga como "" (no como undefined), así que "" cuenta como "no
  // dada" en vez de fallar la validación de min(1).
  ANTHROPIC_API_KEY: z.preprocess(
    (valor) => (valor === "" ? undefined : valor),
    z.string().min(1).optional(),
  ),
  // Requerido y sin default: nunca hardcodear un id de modelo en el código
  // (ver .env.example y docs/ARCHITECTURE.md).
  ANTHROPIC_MODEL: z.string().min(1, "ANTHROPIC_MODEL es requerido (ver .env.example)."),
  MAX_USD_PER_RUN: z.coerce.number().positive().default(0.5),
});
export type Env = z.infer<typeof envSchema>;

/** Valida process.env (o la fuente que se le pase, útil en tests). */
export function cargarEnv(fuente: Record<string, string | undefined> = process.env): Env {
  const resultado = envSchema.safeParse(fuente);
  if (!resultado.success) {
    throw new ConfigError(`Variables de entorno inválidas:\n${resultado.error.message}`);
  }
  return resultado.data;
}
