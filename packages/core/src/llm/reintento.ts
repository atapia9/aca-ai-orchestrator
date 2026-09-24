import { AgentError, LLMValidationError } from "../errors.js";
import type { GenerateStructuredInput, GenerateStructuredResult, LLMProvider } from "./provider.js";

/**
 * Política de reintento única para todos los agentes: 1 intento inicial, y
 * si la salida no valida (LLMValidationError, sin importar el proveedor),
 * 1 reintento pasándole al modelo el error de validación. Si vuelve a
 * fallar, error controlado (AgentError) - nunca reintentos infinitos, nunca
 * salida inválida aceptada.
 */
export async function generarConReintento<T>(
  provider: LLMProvider,
  input: GenerateStructuredInput<T>,
): Promise<GenerateStructuredResult<T>> {
  try {
    return await provider.generateStructured(input);
  } catch (error) {
    if (!(error instanceof LLMValidationError)) {
      throw error;
    }
    try {
      return await provider.generateStructured({
        ...input,
        userPrompt: `${input.userPrompt}\n\n---\nTu respuesta anterior no cumplió el formato esperado:\n${error.message}\n\nGenera una respuesta nueva que sí cumpla exactamente el formato.`,
      });
    } catch (segundoError) {
      throw new AgentError("El modelo no produjo una salida válida tras reintentar.", {
        cause: segundoError,
      });
    }
  }
}
