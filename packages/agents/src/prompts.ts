import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// src/ y prompts/ son hermanos bajo la raiz del paquete, igual que dist/ y
// prompts/ tras el build - por eso esta ruta relativa funciona corriendo
// desde fuente (vitest) o desde dist/ (build real).
const DIR_PROMPTS = join(dirname(fileURLToPath(import.meta.url)), "..", "prompts");

export function cargarPrompt(nombreArchivo: string): string {
  return readFileSync(join(DIR_PROMPTS, nombreArchivo), "utf-8").trim();
}
