import { AgentError, DIMENSIONES_DIAGNOSTICO, MockProvider } from "@acambaro/core";
import { describe, expect, it } from "vitest";
import type { AgentContext } from "../src/contexto.js";
import { ejecutarDiagnostico } from "../src/diagnostico.js";
import { negocioFixture } from "./fixtures.js";

function puntuaciones(puntajes: number[]) {
  return DIMENSIONES_DIAGNOSTICO.map((dimension, i) => ({
    dimension,
    puntaje: puntajes[i]!,
    justificacion: `Justificación de ${dimension}.`,
  }));
}

const salidaValida = {
  puntuaciones: puntuaciones([80, 0, 0, 0, 100, 40]),
  datosVerificados: ["Tiene WhatsApp registrado en la ficha."],
  supuestos: ["No hay campo de Google Business en la ficha."],
  quickWins: ["a", "b", "c"],
};

describe("ejecutarDiagnostico", () => {
  it("regresa el diagnóstico con negocioId y puntajeGeneral calculado (no pedido al modelo)", async () => {
    const provider = new MockProvider([salidaValida]);
    const ctx: AgentContext = { provider };

    const resultado = await ejecutarDiagnostico(negocioFixture, ctx);

    expect(resultado.data.negocioId).toBe(negocioFixture.id);
    // (80+0+0+0+100+40)/6 = 36.67 -> 37
    expect(resultado.data.puntajeGeneral).toBe(37);
    expect(resultado.data.datosVerificados).toEqual(salidaValida.datosVerificados);
    expect(resultado.data.supuestos).toEqual(salidaValida.supuestos);
  });

  it("error controlado si el modelo falla la validación dos veces seguidas", async () => {
    const salidaInvalida = { ...salidaValida, quickWins: ["solo uno"] };
    const provider = new MockProvider([salidaInvalida, salidaInvalida]);
    const ctx: AgentContext = { provider };

    await expect(ejecutarDiagnostico(negocioFixture, ctx)).rejects.toThrow(AgentError);
  });
});
