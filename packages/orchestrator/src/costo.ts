import { BudgetExceededError, type LLMUsage } from "@acambaro/core";

export interface PrecioModelo {
  usdPorMillonInput: number;
  usdPorMillonOutput: number;
}

/**
 * Precios de referencia (USD por millón de tokens) para estimar costo.
 * Esta tabla se queda desactualizada si Anthropic cambia precios o si se
 * usa un modelo nuevo que no está aquí - por diseño usa PRECIO_DEFAULT en
 * ese caso en vez de fallar, pero conviene revisarla de vez en cuando.
 */
const PRECIOS: Record<string, PrecioModelo> = {
  "claude-opus-5": { usdPorMillonInput: 5, usdPorMillonOutput: 25 },
  "claude-sonnet-5": { usdPorMillonInput: 2, usdPorMillonOutput: 10 },
  "claude-haiku-4-5": { usdPorMillonInput: 1, usdPorMillonOutput: 5 },
};
const PRECIO_DEFAULT = PRECIOS["claude-sonnet-5"]!;

export function precioDe(model: string): PrecioModelo {
  return PRECIOS[model] ?? PRECIO_DEFAULT;
}

export function costoUsd(model: string, usage: LLMUsage): number {
  const precio = precioDe(model);
  return (
    (usage.inputTokens / 1_000_000) * precio.usdPorMillonInput +
    (usage.outputTokens / 1_000_000) * precio.usdPorMillonOutput
  );
}

/**
 * Estimación conservadora (peor caso) del costo de UNA llamada que todavía
 * no se hace: asume que usa todo su maxTokens de salida. Sirve para decidir
 * si conviene arrancarla, no para el resumen final (ese usa costoUsd con el
 * usage real).
 */
export function estimarCostoMaximoUsd(
  model: string,
  maxTokens: number,
  inputTokensEstimados = 4000,
): number {
  return costoUsd(model, { inputTokens: inputTokensEstimados, outputTokens: maxTokens });
}

/**
 * Lanza BudgetExceededError si gastoAcumulado + el costo estimado de
 * `llamadas` llamadas adicionales rebasaría maxUsdPerRun. Se llama antes de
 * cada paso (o par de pasos paralelos) que use el modelo.
 */
export function verificarPresupuesto(
  gastoAcumuladoUsd: number,
  model: string,
  maxTokensPorLlamada: number,
  maxUsdPerRun: number,
  llamadas = 1,
): void {
  const estimado = estimarCostoMaximoUsd(model, maxTokensPorLlamada) * llamadas;
  if (gastoAcumuladoUsd + estimado > maxUsdPerRun) {
    throw new BudgetExceededError(
      `Se detiene antes de gastar más: ya van $${gastoAcumuladoUsd.toFixed(4)} USD, la siguiente llamada ` +
        `podría costar hasta $${estimado.toFixed(4)} USD más, y el tope es $${maxUsdPerRun.toFixed(2)} USD ` +
        "(MAX_USD_PER_RUN). Sube el tope o corre con --dry-run para probar sin costo.",
    );
  }
}
