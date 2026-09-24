import { describe, expect, it } from "vitest";
import {
  DIMENSIONES_DIAGNOSTICO,
  calcularPuntajeGeneral,
  diagnosticoLlmSchema,
  diagnosticoSchema,
} from "../../src/types/diagnostico.js";

function puntuacionesCompletas(puntaje: number) {
  return DIMENSIONES_DIAGNOSTICO.map((dimension) => ({
    dimension,
    puntaje,
    justificacion: `Justificación para ${dimension}`,
  }));
}

describe("diagnosticoLlmSchema", () => {
  it("acepta una salida completa con las 6 dimensiones", () => {
    const salida = {
      puntuaciones: puntuacionesCompletas(50),
      datosVerificados: ["Tiene WhatsApp registrado en el directorio."],
      supuestos: ["Se asume que no tiene Google Business Profile: no es un campo del directorio."],
      quickWins: ["a", "b", "c"],
    };
    expect(diagnosticoLlmSchema.parse(salida).puntuaciones).toHaveLength(6);
  });

  it("rechaza si faltan dimensiones", () => {
    const salida = {
      puntuaciones: puntuacionesCompletas(50).slice(0, 5),
      datosVerificados: ["algo"],
      supuestos: [],
      quickWins: ["a", "b", "c"],
    };
    expect(diagnosticoLlmSchema.safeParse(salida).success).toBe(false);
  });

  it("rechaza si quickWins no son exactamente 3", () => {
    const salida = {
      puntuaciones: puntuacionesCompletas(50),
      datosVerificados: ["algo"],
      supuestos: [],
      quickWins: ["a", "b"],
    };
    expect(diagnosticoLlmSchema.safeParse(salida).success).toBe(false);
  });
});

describe("calcularPuntajeGeneral", () => {
  it("promedia las puntuaciones y redondea", () => {
    const puntuaciones = puntuacionesCompletas(0).map((p, i) => ({
      ...p,
      puntaje: i === 0 ? 100 : 0,
    }));
    // 100 + 5*0 = 100 entre 6 = 16.67 -> redondeado 17
    expect(calcularPuntajeGeneral(puntuaciones)).toBe(17);
  });
});

describe("diagnosticoSchema", () => {
  it("extiende el schema del LLM con negocioId y puntajeGeneral", () => {
    const completo = diagnosticoSchema.parse({
      puntuaciones: puntuacionesCompletas(60),
      datosVerificados: ["algo"],
      supuestos: [],
      quickWins: ["a", "b", "c"],
      negocioId: "cafe-la-parroquia",
      puntajeGeneral: 60,
    });
    expect(completo.negocioId).toBe("cafe-la-parroquia");
  });
});
