import { describe, expect, it } from "vitest";
import { diagnosticarNegocio } from "../../src/domain/diagnostico.js";
import { crearNegocio } from "./fixtures.js";

describe("diagnosticarNegocio", () => {
  it("un negocio sin presencia digital obtiene puntaje bajo", () => {
    const negocio = crearNegocio({
      descripcion: "Corto.",
      telefono: undefined,
      whatsapp: undefined,
      sitio_web: undefined,
      redes: undefined,
    });

    const diagnostico = diagnosticarNegocio(negocio);

    expect(diagnostico.puntaje).toBe(0);
    expect(diagnostico.nivel).toBe("bajo");
    expect(diagnostico.servicioSugerido).toMatch(/arranque digital/i);
  });

  it("un negocio con presencia completa obtiene puntaje alto", () => {
    const negocio = crearNegocio({
      descripcion: "Una descripción suficientemente larga para cumplir el factor de contenido.",
      telefono: "417-555-0100",
      whatsapp: "+52 417 555 0100",
      sitio_web: "https://www.ejemplo.example.com",
      redes: {
        facebook: "https://facebook.com/ejemplo.ficticio",
        instagram: "https://instagram.com/ejemplo_ficticio",
        google_maps: "https://maps.google.com/?q=ejemplo",
      },
    });

    const diagnostico = diagnosticarNegocio(negocio);

    expect(diagnostico.puntaje).toBe(100);
    expect(diagnostico.nivel).toBe("alto");
    expect(diagnostico.servicioSugerido).toMatch(/optimización avanzada/i);
  });

  it("un negocio con presencia parcial obtiene nivel medio", () => {
    const negocio = crearNegocio({
      descripcion: "Una descripción suficientemente larga para cumplir el factor de contenido.",
      telefono: "417-555-0100",
      whatsapp: "+52 417 555 0100",
      sitio_web: "https://www.ejemplo.example.com",
      redes: undefined,
    });

    const diagnostico = diagnosticarNegocio(negocio);

    // sitio_web(25) + whatsapp(20) + telefono(10) + descripcion(10) = 65
    expect(diagnostico.puntaje).toBe(65);
    expect(diagnostico.nivel).toBe("medio");
  });

  it("reporta cada factor individualmente con su cumplimiento", () => {
    const negocio = crearNegocio({ sitio_web: "https://www.ejemplo.example.com" });

    const { factores } = diagnosticarNegocio(negocio);
    const sitioWeb = factores.find((factor) => factor.nombre === "Sitio web propio");

    expect(sitioWeb?.cumplido).toBe(true);
    expect(sitioWeb?.puntos).toBe(25);
  });
});
