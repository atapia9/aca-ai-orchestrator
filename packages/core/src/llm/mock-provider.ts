import { LLMValidationError } from "../errors.js";
import type { GenerateStructuredInput, GenerateStructuredResult, LLMProvider } from "./provider.js";

/**
 * Proveedor de pruebas: nunca llama a la API real. Se configura con una
 * cola de respuestas fijas (una por llamada esperada, en orden). Cada
 * respuesta se valida contra el schema pedido, igual que haría un
 * proveedor real, para que las pruebas de reintento sean honestas.
 */
export class MockProvider implements LLMProvider {
  readonly model = "mock";
  private readonly cola: unknown[];

  constructor(respuestas: unknown[]) {
    this.cola = [...respuestas];
  }

  async generateStructured<T>(
    input: GenerateStructuredInput<T>,
  ): Promise<GenerateStructuredResult<T>> {
    if (this.cola.length === 0) {
      throw new Error("MockProvider: no hay más respuestas configuradas para esta prueba.");
    }
    const siguiente = this.cola.shift();
    const resultado = input.schema.safeParse(siguiente);
    if (!resultado.success) {
      throw new LLMValidationError(
        `MockProvider: el fixture no cumple el schema esperado: ${resultado.error.message}`,
      );
    }
    return { data: resultado.data, usage: { inputTokens: 0, outputTokens: 0 } };
  }
}
