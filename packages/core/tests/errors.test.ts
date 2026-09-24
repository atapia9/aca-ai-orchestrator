import { describe, expect, it } from "vitest";
import { AgentError, BudgetExceededError, ConfigError, LLMValidationError } from "../src/errors.js";

describe("clases de error", () => {
  it.each([
    ["LLMValidationError", LLMValidationError],
    ["AgentError", AgentError],
    ["ConfigError", ConfigError],
    ["BudgetExceededError", BudgetExceededError],
  ] as const)("%s tiene name propio y conserva cause", (nombre, Clase) => {
    const causa = new Error("original");
    const error = new Clase("mensaje", { cause: causa });
    expect(error.name).toBe(nombre);
    expect(error.message).toBe("mensaje");
    expect(error.cause).toBe(causa);
    expect(error).toBeInstanceOf(Error);
  });
});
