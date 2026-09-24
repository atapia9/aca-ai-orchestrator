import { describe, expect, it } from "vitest";
import { buscarNegocios, normalizarTexto } from "../../src/domain/busqueda.js";
import { crearNegocio } from "./fixtures.js";

describe("normalizarTexto", () => {
  it("quita acentos, pasa a minúsculas y recorta espacios", () => {
    expect(normalizarTexto("  Café La Parroquía  ")).toBe("cafe la parroquia");
  });
});

describe("buscarNegocios", () => {
  const cafeteria = crearNegocio({
    id: "cafeteria-1",
    nombre: "Café La Parroquia",
    categoria: "cafeteria",
    colonia: "Centro",
    descripcion: "Cafetería con wifi y pan dulce.",
    etiquetas: ["cafe", "wifi"],
  });
  const ferreteria = crearNegocio({
    id: "ferreteria-1",
    nombre: "Ferretería El Tornillo",
    categoria: "ferreteria",
    colonia: "Obrera",
    descripcion: "Herramientas y materiales de construcción.",
    etiquetas: ["ferreteria"],
  });
  const negocios = [cafeteria, ferreteria];

  it("sin filtros regresa todos los negocios", () => {
    expect(buscarNegocios(negocios)).toHaveLength(2);
  });

  it("busca por texto sin importar acentos ni mayúsculas", () => {
    const resultado = buscarNegocios(negocios, { texto: "parroquia" });
    expect(resultado.map((n) => n.id)).toEqual(["cafeteria-1"]);
  });

  it("busca por texto que coincide con una etiqueta", () => {
    const resultado = buscarNegocios(negocios, { texto: "wifi" });
    expect(resultado.map((n) => n.id)).toEqual(["cafeteria-1"]);
  });

  it("filtra por categoría exacta (sin distinguir acentos/mayúsculas)", () => {
    const resultado = buscarNegocios(negocios, { categoria: "Ferreteria" });
    expect(resultado.map((n) => n.id)).toEqual(["ferreteria-1"]);
  });

  it("filtra por colonia", () => {
    const resultado = buscarNegocios(negocios, { colonia: "obrera" });
    expect(resultado.map((n) => n.id)).toEqual(["ferreteria-1"]);
  });

  it("combina texto y categoría", () => {
    const resultado = buscarNegocios(negocios, { texto: "cafe", categoria: "ferreteria" });
    expect(resultado).toHaveLength(0);
  });

  it("filtra por abierto ahora usando la fecha de referencia", () => {
    const abiertoLunes = crearNegocio({
      id: "abierto-lunes",
      horario: { lun: ["09:00-18:00"], mar: [], mie: [], jue: [], vie: [], sab: [], dom: [] },
    });
    const cerradoSiempre = crearNegocio({
      id: "cerrado-siempre",
      horario: { lun: [], mar: [], mie: [], jue: [], vie: [], sab: [], dom: [] },
    });
    const lunesAlMediodiaMx = new Date("2026-01-12T12:00:00-06:00");

    const resultado = buscarNegocios([abiertoLunes, cerradoSiempre], {
      abiertoAhora: true,
      fechaReferencia: lunesAlMediodiaMx,
    });

    expect(resultado.map((n) => n.id)).toEqual(["abierto-lunes"]);
  });
});
