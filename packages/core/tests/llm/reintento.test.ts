import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AgentError, LLMValidationError } from "../../src/errors.js";
import { generarConReintento } from "../../src/llm/reintento.js";
import type {
  GenerateStructuredInput,
  GenerateStructuredResult,
  LLMProvider,
} from "../../src/llm/provider.js";

const schema = z.object({ ok: z.boolean() });
const input: GenerateStructuredInput<z.infer<typeof schema>> = {
  systemPrompt: "sistema",
  userPrompt: "usuario",
  schema,
};

function providerConSecuencia(
  ...respuestas: (GenerateStructuredResult<unknown> | Error)[]
): LLMProvider {
  const generateStructured = vi.fn();
  for (const respuesta of respuestas) {
    if (respuesta instanceof Error) {
      generateStructured.mockRejectedValueOnce(respuesta);
    } else {
      generateStructured.mockResolvedValueOnce(respuesta);
    }
  }
  return { model: "fake", generateStructured };
}

describe("generarConReintento", () => {
  it("regresa el resultado si el primer intento ya es válido", async () => {
    const provider = providerConSecuencia({
      data: { ok: true },
      usage: { inputTokens: 1, outputTokens: 1 },
    });
    const resultado = await generarConReintento(provider, input);
    expect(resultado.data).toEqual({ ok: true });
    expect(provider.generateStructured).toHaveBeenCalledTimes(1);
  });

  it("reintenta una vez tras LLMValidationError y regresa el segundo resultado", async () => {
    const provider = providerConSecuencia(new LLMValidationError("formato inválido"), {
      data: { ok: true },
      usage: { inputTokens: 1, outputTokens: 1 },
    });
    const resultado = await generarConReintento(provider, input);
    expect(resultado.data).toEqual({ ok: true });
    expect(provider.generateStructured).toHaveBeenCalledTimes(2);

    // El segundo intento debe incluir el error de validación para que el modelo se corrija.
    const segundaLlamada = vi.mocked(provider.generateStructured).mock.calls[1]?.[0];
    expect(segundaLlamada?.userPrompt).toContain("formato inválido");
  });

  it("lanza AgentError (error controlado) si falla dos veces seguidas", async () => {
    const provider = providerConSecuencia(
      new LLMValidationError("primer error"),
      new LLMValidationError("segundo error"),
    );
    await expect(generarConReintento(provider, input)).rejects.toThrow(AgentError);
  });

  it("no reintenta y propaga errores que no son de validación (ej. de red/API)", async () => {
    const errorDeRed = new Error("network timeout");
    const provider = providerConSecuencia(errorDeRed);
    await expect(generarConReintento(provider, input)).rejects.toBe(errorDeRed);
    expect(provider.generateStructured).toHaveBeenCalledTimes(1);
  });
});
