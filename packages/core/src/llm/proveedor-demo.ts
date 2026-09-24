import { LLMValidationError } from "../errors.js";
import type { GenerateStructuredInput, GenerateStructuredResult, LLMProvider } from "./provider.js";

/**
 * Proveedor de demo (--dry-run en la CLI, modo mock en `pnpm eval`): nunca
 * llama a la API real. A diferencia de MockProvider (para tests unitarios,
 * con una cola FIFO), este elige el fixture según el contenido del
 * systemPrompt - Estratega y Contenido corren en paralelo en el grafo real,
 * y el orden en que llegan sus llamadas a una cola compartida no está
 * garantizado, así que una cola no sería confiable aquí.
 *
 * Recibe solo el nombre del negocio (no el Negocio completo): con --negocio
 * (búsqueda en el directorio real) el nombre exacto no se conoce todavía
 * cuando se construye el proveedor, antes de que Investigador lo resuelva.
 */
export class ProveedorDemo implements LLMProvider {
  readonly model = "demo";

  constructor(private readonly nombreNegocio: string = "el negocio") {}

  async generateStructured<T>(
    input: GenerateStructuredInput<T>,
  ): Promise<GenerateStructuredResult<T>> {
    const fixture = this.elegirFixture(input.systemPrompt);
    const resultado = input.schema.safeParse(fixture);
    if (!resultado.success) {
      throw new LLMValidationError(
        `ProveedorDemo: el fixture no cumple el schema pedido: ${resultado.error.message}`,
      );
    }
    return { data: resultado.data, usage: { inputTokens: 0, outputTokens: 0 } };
  }

  private elegirFixture(systemPrompt: string): unknown {
    if (systemPrompt.includes("agente de Diagnóstico")) return this.diagnostico();
    if (systemPrompt.includes("agente Estratega")) return this.estratega();
    if (systemPrompt.includes("agente de Contenido")) return this.contenido();
    if (systemPrompt.includes("agente de Propuesta")) return this.propuesta();
    if (systemPrompt.includes("agente Investigador")) return this.investigador();
    throw new Error(
      "ProveedorDemo: no reconozco este prompt de sistema (¿se agregó un agente nuevo?).",
    );
  }

  private diagnostico() {
    const dimensiones = [
      "web",
      "redes_sociales",
      "google_business",
      "resenas",
      "whatsapp_contacto",
      "contenido",
    ];
    return {
      puntuaciones: dimensiones.map((dimension) => ({
        dimension,
        puntaje: 50,
        justificacion: `[demo] Puntaje de ejemplo para ${dimension}.`,
      })),
      datosVerificados: [`[demo] Datos disponibles en la ficha de ${this.nombreNegocio}.`],
      supuestos: ["[demo] Sin llamadas reales al modelo; estos son datos de ejemplo."],
      quickWins: [
        "[demo] Quick win de ejemplo 1",
        "[demo] Quick win de ejemplo 2",
        "[demo] Quick win de ejemplo 3",
      ],
    };
  }

  private estratega() {
    return { servicioId: "diagnostico-expres", justificacion: "[demo] Justificación de ejemplo." };
  }

  private contenido() {
    return [
      { red: "facebook", texto: `[demo] Publicación de ejemplo para ${this.nombreNegocio}.` },
      { red: "instagram", texto: `[demo] Publicación de ejemplo para ${this.nombreNegocio}.` },
      { red: "whatsapp_status", texto: "[demo] Status de ejemplo." },
    ];
  }

  private propuesta() {
    return {
      markdown:
        `# Propuesta de ejemplo (demo)\n\n` +
        `Esta es una propuesta de ejemplo para **${this.nombreNegocio}**, generada con ProveedorDemo ` +
        `(sin costo, sin llamadas reales a la API). Precio en hipótesis, sujeto a validación.`,
    };
  }

  private investigador() {
    return {
      idSeleccionado: null,
      justificacion: "[demo] No aplica: ProveedorDemo no desambigua candidatos reales.",
    };
  }
}
