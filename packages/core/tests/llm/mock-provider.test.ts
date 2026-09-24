import { describe, expect, it } from "vitest";
import { z } from "zod";
import { LLMValidationError } from "../../src/errors.js";
import { MockProvider } from "../../src/llm/mock-provider.js";

const schema = z.object({ saludo: z.string() });

describe("MockProvider", () => {
  it("regresa las respuestas configuradas en orden", async () => {
    const provider = new MockProvider([{ saludo: "hola" }, { saludo: "adiós" }]);
    const primera = await provider.generateStructured({
      systemPrompt: "s",
      userPrompt: "u",
      schema,
    });
    const segunda = await provider.generateStructured({
      systemPrompt: "s",
      userPrompt: "u",
      schema,
    });
    expect(primera.data.saludo).toBe("hola");
    expect(segunda.data.saludo).toBe("adiós");
  });

  it("lanza LLMValidationError si el fixture no cumple el schema", async () => {
    const provider = new MockProvider([{ saludo: 123 }]);
    await expect(
      provider.generateStructured({ systemPrompt: "s", userPrompt: "u", schema }),
    ).rejects.toThrow(LLMValidationError);
  });

  it("lanza un error claro si se acaban las respuestas configuradas", async () => {
    const provider = new MockProvider([]);
    await expect(
      provider.generateStructured({ systemPrompt: "s", userPrompt: "u", schema }),
    ).rejects.toThrow(/no hay más respuestas/);
  });

  it("reporta uso en cero (nunca llama a la API real)", async () => {
    const provider = new MockProvider([{ saludo: "hola" }]);
    const resultado = await provider.generateStructured({
      systemPrompt: "s",
      userPrompt: "u",
      schema,
    });
    expect(resultado.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
  });
});
