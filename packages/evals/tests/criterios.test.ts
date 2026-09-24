import type { Servicio } from "@acambaro/core";
import type { ResultadoCorrida } from "@acambaro/orchestrator";
import { describe, expect, it } from "vitest";
import { evaluarCorrida, pareceEspanol } from "../src/criterios.js";

const servicios: Servicio[] = [
  { id: "diagnostico-expres", nombre: "Diagnóstico exprés", precio_mxn: 0, estado: "hipotesis" },
  {
    id: "taller-operacion-digital",
    nombre: "Taller Operación Digital Productiva",
    precio_mxn: 9999,
    estado: "confirmado",
  },
];

function resultadoBase(
  overrides: Partial<ResultadoCorrida["estado"]["steps"]> = {},
): ResultadoCorrida {
  return {
    completo: true,
    resumen: { outputDir: "/tmp/x", duracionMs: 1, costoTotalUsd: 0, porAgente: {} },
    estado: {
      version: 1,
      auto: true,
      dryRun: true,
      createdAt: "",
      updatedAt: "",
      steps: {
        estratega: {
          completedAt: "",
          usage: { inputTokens: 0, outputTokens: 0 },
          data: { negocioId: "x", servicio: servicios[0]!, justificacion: "x" },
        },
        contenido: {
          completedAt: "",
          usage: { inputTokens: 0, outputTokens: 0 },
          data: [
            { red: "facebook", texto: "Ven a nuestra tienda en el centro de Acámbaro." },
            { red: "instagram", texto: "Tenemos productos frescos para ti y tu familia." },
            { red: "whatsapp_status", texto: "Abrimos hoy con promociones especiales." },
          ],
        },
        propuesta: {
          completedAt: "",
          usage: { inputTokens: 0, outputTokens: 0 },
          data: {
            markdown: "Precio en hipótesis, sujeto a validación.",
            negocioId: "x",
            servicioId: servicios[0]!.id,
          },
        },
        ...overrides,
      },
    },
  };
}

describe("pareceEspanol", () => {
  it("acepta texto con stopwords en español", () => {
    expect(pareceEspanol("Ven a nuestra tienda en el centro de la ciudad.")).toBe(true);
  });

  it("rechaza texto en inglés puro", () => {
    expect(pareceEspanol("Come visit our shop downtown today!")).toBe(false);
  });
});

describe("evaluarCorrida", () => {
  it("pasa todos los criterios en un caso bien formado", () => {
    const criterios = evaluarCorrida(resultadoBase(), servicios);
    expect(criterios.every((c) => c.paso)).toBe(true);
  });

  it("falla si la corrida no completó", () => {
    const resultado = resultadoBase();
    resultado.completo = false;
    const criterios = evaluarCorrida(resultado, servicios);
    expect(criterios.find((c) => c.nombre.includes("completa"))?.paso).toBe(false);
  });

  it("falla si el servicioId no existe en la escalera", () => {
    const resultado = resultadoBase({
      estratega: {
        completedAt: "",
        usage: { inputTokens: 0, outputTokens: 0 },
        data: {
          negocioId: "x",
          servicio: { ...servicios[0]!, id: "no-existe" },
          justificacion: "x",
        },
      },
    });
    const criterios = evaluarCorrida(resultado, servicios);
    expect(criterios.find((c) => c.nombre.includes("sdda-servicios.yaml"))?.paso).toBe(false);
  });

  it("falla si una publicación no parece estar en español", () => {
    const resultado = resultadoBase({
      contenido: {
        completedAt: "",
        usage: { inputTokens: 0, outputTokens: 0 },
        data: [
          { red: "facebook", texto: "Visit our shop today for great deals!" },
          { red: "instagram", texto: "Tenemos productos frescos para ti y tu familia." },
          { red: "whatsapp_status", texto: "Abrimos hoy con promociones especiales." },
        ],
      },
    });
    const criterios = evaluarCorrida(resultado, servicios);
    expect(criterios.find((c) => c.nombre.includes("español"))?.paso).toBe(false);
  });

  it("falla si el servicio es hipótesis y la propuesta no lo marca", () => {
    const resultado = resultadoBase({
      propuesta: {
        completedAt: "",
        usage: { inputTokens: 0, outputTokens: 0 },
        data: { markdown: "Precio: $0 MXN.", negocioId: "x", servicioId: servicios[0]!.id },
      },
    });
    const criterios = evaluarCorrida(resultado, servicios);
    expect(criterios.find((c) => c.nombre.includes("hipótesis"))?.paso).toBe(false);
  });

  it("no exige mencionar hipótesis si el servicio ya está confirmado", () => {
    const resultado = resultadoBase({
      estratega: {
        completedAt: "",
        usage: { inputTokens: 0, outputTokens: 0 },
        data: { negocioId: "x", servicio: servicios[1]!, justificacion: "x" },
      },
      propuesta: {
        completedAt: "",
        usage: { inputTokens: 0, outputTokens: 0 },
        data: {
          markdown: "Precio confirmado: $9,999 MXN.",
          negocioId: "x",
          servicioId: servicios[1]!.id,
        },
      },
    });
    const criterios = evaluarCorrida(resultado, servicios);
    expect(criterios.find((c) => c.nombre.includes("hipótesis"))?.paso).toBe(true);
  });
});
