import { describe, expect, it } from "vitest";
import { cargarEnv } from "../../src/config/env.js";
import { ConfigError } from "../../src/errors.js";

describe("cargarEnv", () => {
  it("acepta un entorno mínimo válido y aplica el default de MAX_USD_PER_RUN", () => {
    const env = cargarEnv({ ANTHROPIC_MODEL: "claude-sonnet-5" });
    expect(env.MAX_USD_PER_RUN).toBe(0.5);
    expect(env.ANTHROPIC_API_KEY).toBeUndefined();
  });

  it("respeta un MAX_USD_PER_RUN explícito", () => {
    const env = cargarEnv({ ANTHROPIC_MODEL: "claude-sonnet-5", MAX_USD_PER_RUN: "1.25" });
    expect(env.MAX_USD_PER_RUN).toBe(1.25);
  });

  it("trata ANTHROPIC_API_KEY='' (como la deja .env.example) igual que si no estuviera dada", () => {
    const env = cargarEnv({ ANTHROPIC_MODEL: "claude-sonnet-5", ANTHROPIC_API_KEY: "" });
    expect(env.ANTHROPIC_API_KEY).toBeUndefined();
  });

  it("lanza ConfigError si falta ANTHROPIC_MODEL", () => {
    expect(() => cargarEnv({})).toThrow(ConfigError);
  });

  it("lanza ConfigError si MAX_USD_PER_RUN no es un número positivo", () => {
    expect(() => cargarEnv({ ANTHROPIC_MODEL: "claude-sonnet-5", MAX_USD_PER_RUN: "-1" })).toThrow(
      ConfigError,
    );
  });
});
