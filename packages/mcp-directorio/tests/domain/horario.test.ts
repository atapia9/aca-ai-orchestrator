import { describe, expect, it } from "vitest";
import {
  estaAbiertoAhora,
  estaAbiertoEnMomento,
  negociosAbiertosEn,
} from "../../src/domain/horario.js";
import { crearNegocio } from "./fixtures.js";

describe("estaAbiertoEnMomento", () => {
  const negocio = crearNegocio({
    horario: {
      lun: ["09:00-14:00", "16:00-21:00"],
      mar: ["09:00-14:00", "16:00-21:00"],
      mie: ["09:00-14:00", "16:00-21:00"],
      jue: ["09:00-14:00", "16:00-21:00"],
      vie: ["09:00-14:00", "16:00-21:00"],
      sab: [],
      dom: ["20:00-02:00"],
    },
  });

  it("reconoce un momento dentro de un rango", () => {
    expect(estaAbiertoEnMomento(negocio, "lun", 10 * 60)).toBe(true);
  });

  it("reconoce un momento fuera de todos los rangos (hora de comida)", () => {
    expect(estaAbiertoEnMomento(negocio, "lun", 15 * 60)).toBe(false);
  });

  it("el límite final del rango no está incluido", () => {
    expect(estaAbiertoEnMomento(negocio, "lun", 14 * 60)).toBe(false);
  });

  it("un día sin rangos siempre está cerrado", () => {
    expect(estaAbiertoEnMomento(negocio, "sab", 12 * 60)).toBe(false);
  });

  it("soporta rangos que cruzan la medianoche", () => {
    expect(estaAbiertoEnMomento(negocio, "dom", 23 * 60)).toBe(true);
    expect(estaAbiertoEnMomento(negocio, "dom", 1 * 60)).toBe(true);
    expect(estaAbiertoEnMomento(negocio, "dom", 10 * 60)).toBe(false);
  });
});

describe("estaAbiertoAhora", () => {
  const negocio = crearNegocio({
    horario: {
      lun: ["09:00-18:00"],
      mar: [],
      mie: [],
      jue: [],
      vie: [],
      sab: [],
      dom: [],
    },
  });

  it("usa la zona horaria America/Mexico_City, no la del sistema", () => {
    // 2026-01-12 es lunes; 15:30 hora de Ciudad de México (UTC-6).
    const lunesAlMediodiaMx = new Date("2026-01-12T15:30:00-06:00");
    expect(estaAbiertoAhora(negocio, lunesAlMediodiaMx)).toBe(true);

    const lunesDeNocheMx = new Date("2026-01-12T22:00:00-06:00");
    expect(estaAbiertoAhora(negocio, lunesDeNocheMx)).toBe(false);

    // 2026-01-13 es martes, día sin horario.
    const martesMx = new Date("2026-01-13T15:30:00-06:00");
    expect(estaAbiertoAhora(negocio, martesMx)).toBe(false);
  });
});

describe("negociosAbiertosEn", () => {
  it("filtra solo los negocios abiertos en el día y hora indicados", () => {
    const abierto = crearNegocio({
      id: "abierto",
      horario: { lun: ["09:00-18:00"], mar: [], mie: [], jue: [], vie: [], sab: [], dom: [] },
    });
    const cerrado = crearNegocio({
      id: "cerrado",
      horario: { lun: [], mar: [], mie: [], jue: [], vie: [], sab: [], dom: [] },
    });

    const resultado = negociosAbiertosEn([abierto, cerrado], "lun", "10:00");

    expect(resultado.map((n) => n.id)).toEqual(["abierto"]);
  });
});
