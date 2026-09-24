import { describe, expect, it } from "vitest";
import { crearPropuestaLlmSchema } from "../../src/types/propuesta.js";
import type { Servicio } from "../../src/config/servicios.js";

const servicioConfirmado: Servicio = {
  id: "taller-operacion-digital",
  nombre: "Taller Operación Digital Productiva",
  precio_mxn: 9999,
  estado: "confirmado",
};

const servicioHipotesis: Servicio = {
  id: "mapa-oportunidades",
  nombre: "Mapa de Oportunidades",
  precio_mxn: 4900,
  estado: "hipotesis",
};

describe("crearPropuestaLlmSchema", () => {
  it("acepta cualquier markdown si el servicio ya está confirmado", () => {
    const schema = crearPropuestaLlmSchema(servicioConfirmado);
    expect(schema.safeParse({ markdown: "# Propuesta\nPrecio: $9,999 MXN." }).success).toBe(true);
  });

  it("rechaza un markdown que no marca el precio como hipótesis", () => {
    const schema = crearPropuestaLlmSchema(servicioHipotesis);
    expect(schema.safeParse({ markdown: "# Propuesta\nPrecio: $4,900 MXN." }).success).toBe(false);
  });

  it("acepta el markdown si sí menciona la palabra hipótesis", () => {
    const schema = crearPropuestaLlmSchema(servicioHipotesis);
    const resultado = schema.safeParse({
      markdown: "# Propuesta\nPrecio: $4,900 MXN (precio en hipótesis, sujeto a validación).",
    });
    expect(resultado.success).toBe(true);
  });
});
