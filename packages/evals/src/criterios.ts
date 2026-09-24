import { LIMITES_CARACTERES, type Publicacion, type Servicio } from "@acambaro/core";
import type { ResultadoCorrida } from "@acambaro/orchestrator";

export interface CriterioResultado {
  nombre: string;
  paso: boolean;
  detalle?: string;
}

const STOPWORDS_ESPANOL = /\b(de|la|el|en|con|para|una|un|y|que|los|las|del|su|es|por|más)\b/i;

/** Heurística ligera de "parece español": basta un stopword común. No es detección de idioma real. */
export function pareceEspanol(texto: string): boolean {
  return STOPWORDS_ESPANOL.test(texto);
}

/**
 * Criterios verificables de la sección "Fase 5" del brief. La mayoría ya
 * están garantizados por construcción (zod dentro del propio pipeline: si
 * ejecutarDiagnosticoExpres no lanzó, la salida de cada agente ya validó) -
 * se re-verifican aquí explícitamente para el reporte, y para el único
 * criterio que zod no puede expresar (el idioma).
 */
export function evaluarCorrida(
  resultado: ResultadoCorrida,
  servicios: Servicio[],
): CriterioResultado[] {
  const criterios: CriterioResultado[] = [];

  criterios.push({
    nombre: "La corrida completa los 5 pasos sin error de validación",
    paso: resultado.completo,
  });

  const servicioId = resultado.estado.steps.estratega?.data.servicio.id;
  criterios.push({
    nombre: "La recomendación existe en config/sdda-servicios.yaml",
    paso: servicioId !== undefined && servicios.some((s) => s.id === servicioId),
    detalle: servicioId,
  });

  const publicaciones: Publicacion[] = resultado.estado.steps.contenido?.data ?? [];
  criterios.push({
    nombre: "Las 3 publicaciones están en español",
    paso: publicaciones.length === 3 && publicaciones.every((p) => pareceEspanol(p.texto)),
  });

  criterios.push({
    nombre: "Las publicaciones respetan el límite de caracteres de su red",
    paso: publicaciones.every((p) => p.texto.length <= LIMITES_CARACTERES[p.red]),
  });

  const servicio = servicios.find((s) => s.id === servicioId);
  const propuestaMd = resultado.estado.steps.propuesta?.data.markdown ?? "";
  criterios.push({
    nombre:
      "La propuesta marca visiblemente un precio en hipótesis (si el servicio no está confirmado)",
    paso: servicio?.estado !== "hipotesis" || /hip[oó]tesis/i.test(propuestaMd),
  });

  return criterios;
}
