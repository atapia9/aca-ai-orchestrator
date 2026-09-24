import type { z } from "zod";

export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface GenerateStructuredInput<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  maxTokens?: number;
}

export interface GenerateStructuredResult<T> {
  data: T;
  usage: LLMUsage;
}

/**
 * Proveedor de LLM intercambiable. Una sola llamada, sin reintentos propios
 * (eso lo maneja `generarConReintento`, agnóstico del proveedor) - así
 * AnthropicProvider y MockProvider se mantienen simples y simétricos.
 */
export interface LLMProvider {
  readonly model: string;
  generateStructured<T>(input: GenerateStructuredInput<T>): Promise<GenerateStructuredResult<T>>;
}
