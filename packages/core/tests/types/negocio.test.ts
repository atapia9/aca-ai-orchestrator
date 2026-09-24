import { describe, expect, it } from "vitest";
import { negocioSchema } from "../../src/types/negocio.js";

const negocioValido = {
  id: "cafe-la-parroquia",
  nombre: "Café La Parroquia",
  categoria: "cafeteria",
  descripcion: "Cafetería de barrio con pan dulce recién horneado.",
  direccion: "Portal Hidalgo 12",
  colonia: "Centro",
  whatsapp: "+52 417 555 0101",
  horario: { lun: ["08:00-14:00"], dom: ["09:00-13:00"] },
  etiquetas: ["cafe", "wifi"],
  actualizado: "2026-01-12",
};

describe("negocioSchema", () => {
  it("acepta una ficha mínima válida", () => {
    expect(negocioSchema.parse(negocioValido)).toMatchObject({ id: "cafe-la-parroquia" });
  });

  it("acepta ficticio:true para samples", () => {
    const resultado = negocioSchema.parse({ ...negocioValido, ficticio: true });
    expect(resultado.ficticio).toBe(true);
  });

  it("acepta horario parcial (no todos los días necesitan entrada)", () => {
    const resultado = negocioSchema.safeParse({
      ...negocioValido,
      horario: { lun: ["08:00-14:00"] },
    });
    expect(resultado.success).toBe(true);
  });

  it("rechaza si el valor de un día no es un arreglo de strings", () => {
    const resultado = negocioSchema.safeParse({
      ...negocioValido,
      horario: { lun: "08:00-14:00" },
    });
    expect(resultado.success).toBe(false);
  });

  it("rechaza si faltan campos requeridos", () => {
    const { nombre: _nombre, ...sinNombre } = negocioValido;
    expect(negocioSchema.safeParse(sinNombre).success).toBe(false);
  });
});
