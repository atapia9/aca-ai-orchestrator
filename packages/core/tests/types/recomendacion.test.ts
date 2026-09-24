import { describe, expect, it } from "vitest";
import { recomendacionLlmSchema, recomendacionSchema } from "../../src/types/recomendacion.js";

describe("recomendacionLlmSchema", () => {
  it("acepta servicioId y justificacion", () => {
    const resultado = recomendacionLlmSchema.safeParse({
      servicioId: "taller-operacion-digital",
      justificacion: "El negocio ya tiene presencia básica, necesita estructurar su operación.",
    });
    expect(resultado.success).toBe(true);
  });

  it("rechaza sin justificacion", () => {
    expect(recomendacionLlmSchema.safeParse({ servicioId: "x" }).success).toBe(false);
  });
});

describe("recomendacionSchema", () => {
  it("incluye el servicio completo resuelto contra el YAML", () => {
    const resultado = recomendacionSchema.parse({
      negocioId: "cafe-la-parroquia",
      servicio: {
        id: "taller-operacion-digital",
        nombre: "Taller Operación Digital Productiva",
        precio_mxn: 9999,
        estado: "confirmado",
      },
      justificacion: "Justificación completa.",
    });
    expect(resultado.servicio.estado).toBe("confirmado");
  });
});
