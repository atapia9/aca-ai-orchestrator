import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { LLMValidationError } from "../../src/errors.js";
import { AnthropicProvider } from "../../src/llm/anthropic-provider.js";

const schema = z.object({ ok: z.boolean() });

function providerConClienteFalso(parse: ReturnType<typeof vi.fn>): AnthropicProvider {
  const clienteFalso = { messages: { parse } } as unknown as Anthropic;
  return new AnthropicProvider({ model: "claude-sonnet-5", client: clienteFalso });
}

describe("AnthropicProvider", () => {
  it("regresa parsed_output y el usage cuando la llamada es válida", async () => {
    const parse = vi.fn().mockResolvedValue({
      parsed_output: { ok: true },
      usage: { input_tokens: 10, output_tokens: 5 },
    });
    const provider = providerConClienteFalso(parse);

    const resultado = await provider.generateStructured({
      systemPrompt: "s",
      userPrompt: "u",
      schema,
    });

    expect(resultado).toEqual({ data: { ok: true }, usage: { inputTokens: 10, outputTokens: 5 } });
  });

  it("lanza LLMValidationError (reintentable) si parsed_output es null", async () => {
    const parse = vi
      .fn()
      .mockResolvedValue({ parsed_output: null, usage: { input_tokens: 1, output_tokens: 1 } });
    const provider = providerConClienteFalso(parse);

    await expect(
      provider.generateStructured({ systemPrompt: "s", userPrompt: "u", schema }),
    ).rejects.toThrow(LLMValidationError);
  });

  it("envuelve un AnthropicError de formato como LLMValidationError (reintentable)", async () => {
    const parse = vi
      .fn()
      .mockRejectedValue(new Anthropic.AnthropicError("Failed to parse structured output"));
    const provider = providerConClienteFalso(parse);

    await expect(
      provider.generateStructured({ systemPrompt: "s", userPrompt: "u", schema }),
    ).rejects.toThrow(LLMValidationError);
  });

  it("propaga un APIError (red/auth/rate-limit) sin envolverlo - no vale la pena reintentar con 'corrige el formato'", async () => {
    const errorDeApi = new Anthropic.APIError(429, {}, "rate limited", undefined);
    const parse = vi.fn().mockRejectedValue(errorDeApi);
    const provider = providerConClienteFalso(parse);

    await expect(
      provider.generateStructured({ systemPrompt: "s", userPrompt: "u", schema }),
    ).rejects.toBe(errorDeApi);
  });
});
