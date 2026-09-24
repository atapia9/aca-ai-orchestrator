import { describe, expect, it } from "vitest";
import { obtenerCategorias, obtenerNegocioPorId, obtenerNegocios } from "../../src/data/repo.js";
import negociosJson from "../../src/data/negocios.json" with { type: "json" };

describe("repo (SQLite en memoria)", () => {
  it("obtenerNegocios regresa todos los negocios de negocios.json", () => {
    expect(obtenerNegocios()).toHaveLength(negociosJson.length);
  });

  it("obtenerNegocioPorId reconstruye un negocio con redes, horario y etiquetas intactos", () => {
    const negocio = obtenerNegocioPorId("cafe-la-parroquia");

    expect(negocio?.nombre).toBe("Café La Parroquia");
    expect(negocio?.redes).toEqual({
      facebook: "https://facebook.com/cafelaparroquia.ficticio",
      instagram: "https://instagram.com/cafelaparroquia_ficticio",
      google_maps: "https://maps.google.com/?q=Cafe+La+Parroquia+Acambaro+ficticio",
    });
    expect(negocio?.horario.lun).toEqual(["08:00-14:00", "16:00-21:00"]);
    expect(negocio?.etiquetas).toEqual(["cafe", "desayunos", "wifi"]);
  });

  it("un negocio sin redes/teléfono/whatsapp los regresa como undefined, no null", () => {
    const negocio = obtenerNegocioPorId("moda-joven-acambaro");

    expect(negocio?.telefono).toBeUndefined();
    expect(negocio?.whatsapp).toBeUndefined();
    expect(negocio?.redes).toBeUndefined();
  });

  it("obtenerNegocioPorId regresa undefined si el id no existe", () => {
    expect(obtenerNegocioPorId("no-existe")).toBeUndefined();
  });

  it("obtenerCategorias regresa categorías únicas y ordenadas", () => {
    const categorias = obtenerCategorias();

    expect(categorias).toEqual([...categorias].sort());
    expect(new Set(categorias).size).toBe(categorias.length);
    expect(categorias).toContain("cafeteria");
  });
});
