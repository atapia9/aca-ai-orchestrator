import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { LLMValidationError } from "../errors.js";
import type { GenerateStructuredInput, GenerateStructuredResult, LLMProvider } from "./provider.js";

export interface AnthropicProviderOptions {
  model: string;
  apiKey?: string;
  /** Para pruebas: inyecta un cliente ya construido en vez de crear uno real. */
  client?: Anthropic;
}

export class AnthropicProvider implements LLMProvider {
  readonly model: string;
  private readonly client: Anthropic;

  constructor(options: AnthropicProviderOptions) {
    this.model = options.model;
    this.client = options.client ?? new Anthropic({ apiKey: options.apiKey });
  }

  async generateStructured<T>(
    input: GenerateStructuredInput<T>,
  ): Promise<GenerateStructuredResult<T>> {
    try {
      const respuesta = await this.client.messages.parse({
        model: this.model,
        max_tokens: input.maxTokens ?? 4096,
        system: input.systemPrompt,
        messages: [{ role: "user", content: input.userPrompt }],
        output_config: { format: zodOutputFormat(input.schema) },
      });

      if (respuesta.parsed_output === null) {
        throw new LLMValidationError("El modelo no regresó una salida estructurada válida.");
      }

      return {
        data: respuesta.parsed_output,
        usage: {
          inputTokens: respuesta.usage.input_tokens,
          outputTokens: respuesta.usage.output_tokens,
        },
      };
    } catch (error) {
      // Errores de API/red/auth/rate-limit: no son un problema de formato,
      // no tiene caso reintentar con "corrige tu respuesta".
      if (error instanceof Anthropic.APIError) {
        throw error;
      }
      throw new LLMValidationError(
        error instanceof Error ? error.message : "Salida estructurada inválida.",
        { cause: error },
      );
    }
  }
}
