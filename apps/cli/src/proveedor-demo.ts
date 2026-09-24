import {
  LLMValidationError,
  type GenerateStructuredInput,
  type GenerateStructuredResult,
  type LLMProvider,
} from "@acambaro/core";

/**
 * Proveedor de --dry-run: nunca llama a la API real. A diferencia de
 * MockProvider (para tests, con una cola FIFO), este elige el fixture según
 * el contenido del systemPrompt - Estratega y Contenido corren en paralelo
 * en el grafo real, y el orden en que llegan sus llamadas no está
 * garantizado, así que una cola no sería confiable aquí.
 *
 * Recibe solo el nombre del negocio (no el Negocio completo): con --negocio
 * (búsqueda en el directorio real) el nombre exacto no se conoce todavía
 * cuando se construye el proveedor, antes de que Investigador lo resuelva.
 */
export class ProveedorDemo implements LLMProvider {
  readonly model = "dry-run";

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
        justificacion: `[dry-run] Puntaje de ejemplo para ${dimension}.`,
      })),
      datosVerificados: [`[dry-run] Datos disponibles en la ficha de ${this.nombreNegocio}.`],
      supuestos: ["[dry-run] Sin llamadas reales al modelo; estos son datos de ejemplo."],
      quickWins: [
        "[dry-run] Quick win de ejemplo 1",
        "[dry-run] Quick win de ejemplo 2",
        "[dry-run] Quick win de ejemplo 3",
      ],
    };
  }

  private estratega() {
    return {
      servicioId: "diagnostico-expres",
      justificacion: "[dry-run] Justificación de ejemplo.",
    };
  }

  private contenido() {
    return [
      { red: "facebook", texto: `[dry-run] Publicación de ejemplo para ${this.nombreNegocio}.` },
      { red: "instagram", texto: `[dry-run] Publicación de ejemplo para ${this.nombreNegocio}.` },
      { red: "whatsapp_status", texto: "[dry-run] Status de ejemplo." },
    ];
  }

  private propuesta() {
    return {
      markdown:
        `# Propuesta de ejemplo (dry-run)\n\n` +
        `Esta es una propuesta de ejemplo para **${this.nombreNegocio}**, generada con ProveedorDemo ` +
        `(sin costo, sin llamadas reales a la API). Precio en hipótesis, sujeto a validación.`,
    };
  }

  private investigador() {
    return {
      idSeleccionado: null,
      justificacion: "[dry-run] No aplica: ProveedorDemo no desambigua candidatos reales.",
    };
  }
}
