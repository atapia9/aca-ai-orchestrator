import {
  crearPropuestaLlmSchema,
  diagnosticoLlmSchema,
  publicacionesLlmSchema,
  recomendacionLlmSchema,
  type Servicio,
} from "@acambaro/core";
import { describe, expect, it } from "vitest";
import { ProveedorDemo } from "../src/proveedor-demo.js";

const servicioHipotesis: Servicio = {
  id: "diagnostico-expres",
  nombre: "Diagnóstico exprés",
  precio_mxn: 0,
  estado: "hipotesis",
};

async function generar(
  systemPrompt: string,
  schema: Parameters<ProveedorDemo["generateStructured"]>[0]["schema"],
) {
  const provider = new ProveedorDemo("Negocio de prueba");
  return provider.generateStructured({ systemPrompt, userPrompt: "u", schema });
}

describe("ProveedorDemo", () => {
  it("el fixture de Diagnóstico cumple diagnosticoLlmSchema", async () => {
    const resultado = await generar(
      "Eres el agente de Diagnóstico de SDDA...",
      diagnosticoLlmSchema,
    );
    expect(resultado.data.puntuaciones).toHaveLength(6);
    expect(resultado.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
  });

  it("el fixture de Estratega cumple recomendacionLlmSchema", async () => {
    const resultado = await generar("Eres el agente Estratega de SDDA...", recomendacionLlmSchema);
    expect(resultado.data.servicioId).toBe("diagnostico-expres");
  });

  it("el fixture de Contenido cumple publicacionesLlmSchema", async () => {
    const resultado = await generar(
      "Eres el agente de Contenido de SDDA...",
      publicacionesLlmSchema,
    );
    expect(resultado.data).toHaveLength(3);
  });

  it("el fixture de Propuesta menciona 'hipótesis' (cumple crearPropuestaLlmSchema para un servicio no confirmado)", async () => {
    const schema = crearPropuestaLlmSchema(servicioHipotesis);
    const resultado = await generar("Eres el agente de Propuesta de SDDA...", schema);
    expect(resultado.data.markdown.toLowerCase()).toContain("hipótesis");
  });

  it("personaliza el texto con el nombre del negocio cuando se conoce", async () => {
    const provider = new ProveedorDemo("Café La Parroquia");
    const resultado = await provider.generateStructured({
      systemPrompt: "Eres el agente de Contenido de SDDA...",
      userPrompt: "u",
      schema: publicacionesLlmSchema,
    });
    expect(resultado.data.some((p) => p.texto.includes("Café La Parroquia"))).toBe(true);
  });

  it("lanza un error claro si el prompt no corresponde a ningún agente conocido", async () => {
    await expect(generar("prompt desconocido", diagnosticoLlmSchema)).rejects.toThrow(
      /no reconozco/,
    );
  });
});
