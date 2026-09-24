import { BudgetExceededError } from "@acambaro/core";
import { describe, expect, it } from "vitest";
import { costoUsd, estimarCostoMaximoUsd, precioDe, verificarPresupuesto } from "../src/costo.js";

describe("precioDe / costoUsd", () => {
  it("calcula el costo con el precio conocido de un modelo", () => {
    const costo = costoUsd("claude-sonnet-5", { inputTokens: 1_000_000, outputTokens: 1_000_000 });
    expect(costo).toBeCloseTo(2 + 10, 5);
  });

  it("usa un precio por default (el de sonnet-5) para un modelo desconocido", () => {
    expect(precioDe("modelo-que-no-existe")).toEqual(precioDe("claude-sonnet-5"));
  });
});

describe("estimarCostoMaximoUsd", () => {
  it("asume el peor caso: todo el maxTokens como salida", () => {
    const estimado = estimarCostoMaximoUsd("claude-sonnet-5", 4096, 0);
    expect(estimado).toBeCloseTo((4096 / 1_000_000) * 10, 6);
  });
});

describe("verificarPresupuesto", () => {
  it("no lanza si el gasto acumulado + estimado está dentro del tope", () => {
    expect(() => verificarPresupuesto(0, "claude-sonnet-5", 4096, 0.5)).not.toThrow();
  });

  it("lanza BudgetExceededError si se rebasaría el tope", () => {
    expect(() => verificarPresupuesto(0.49, "claude-sonnet-5", 4096, 0.5)).toThrow(
      BudgetExceededError,
    );
  });

  it("considera varias llamadas simultáneas (paso paralelo)", () => {
    // una llamada cabe, dos no
    expect(() => verificarPresupuesto(0, "claude-sonnet-5", 4096, 0.05, 1)).not.toThrow();
    expect(() => verificarPresupuesto(0, "claude-sonnet-5", 4096, 0.05, 2)).toThrow(
      BudgetExceededError,
    );
  });
});
