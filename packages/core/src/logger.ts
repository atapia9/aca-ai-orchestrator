import pino from "pino";

/** Logger estructurado (JSON) para el orquestador y los agentes. */
export function crearLogger(nombre: string): pino.Logger {
  return pino({
    name: nombre,
    level: process.env.LOG_LEVEL ?? "info",
  });
}

export type Logger = pino.Logger;
