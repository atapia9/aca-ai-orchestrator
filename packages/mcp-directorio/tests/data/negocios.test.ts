import { describe, expect, it } from "vitest";
import negocios from "../../src/data/negocios.json" with { type: "json" };
import type { Dia, Negocio } from "../../src/domain/tipos.js";

const DIAS: Dia[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
const RANGO_VALIDO = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

describe("negocios.json", () => {
  const lista = negocios as Negocio[];

  it("tiene entre 15 y 30 negocios", () => {
    expect(lista.length).toBeGreaterThanOrEqual(15);
    expect(lista.length).toBeLessThanOrEqual(30);
  });

  it("cubre al menos 6 categorías distintas", () => {
    const categorias = new Set(lista.map((negocio) => negocio.categoria));
    expect(categorias.size).toBeGreaterThanOrEqual(6);
  });

  it("no tiene ids duplicados", () => {
    const ids = lista.map((negocio) => negocio.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada negocio define los 7 días de la semana con rangos válidos", () => {
    for (const negocio of lista) {
      for (const dia of DIAS) {
        const rangos = negocio.horario[dia];
        expect(rangos, `${negocio.id} sin definición para ${dia}`).toBeDefined();
        for (const rango of rangos) {
          expect(rango, `${negocio.id} tiene un rango inválido en ${dia}: ${rango}`).toMatch(RANGO_VALIDO);
        }
      }
    }
  });

  it("no usa números telefónicos ni sitios web que aparenten ser reales", () => {
    for (const negocio of lista) {
      if (negocio.telefono) {
        expect(negocio.telefono, `${negocio.id} debe usar el prefijo ficticio 555`).toMatch(/555/);
      }
      if (negocio.sitio_web) {
        expect(negocio.sitio_web, `${negocio.id} debe usar el dominio reservado example.com`).toContain(
          ".example.com",
        );
      }
    }
  });
});
