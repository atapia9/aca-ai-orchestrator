import {
  DIMENSIONES_DIAGNOSTICO,
  type Diagnostico,
  type Negocio,
  type Publicaciones,
  type Recomendacion,
} from "@acambaro/core";
import { describe, expect, it } from "vitest";
import {
  renderContenido,
  renderDiagnostico,
  renderFicha,
  renderRecomendacion,
} from "../src/reportes.js";

const negocio: Negocio = {
  id: "cafe-la-parroquia",
  nombre: "Café La Parroquia",
  categoria: "cafeteria",
  descripcion: "Cafetería de barrio.",
  direccion: "Portal Hidalgo 12",
  colonia: "Centro",
  whatsapp: "+52 417 555 0101",
  horario: { lun: ["08:00-14:00"] },
  etiquetas: ["cafe"],
  actualizado: "2026-01-12",
  ficticio: true,
};

const diagnostico: Diagnostico = {
  negocioId: negocio.id,
  puntuaciones: DIMENSIONES_DIAGNOSTICO.map((dimension) => ({
    dimension,
    puntaje: 50,
    justificacion: "x",
  })),
  datosVerificados: ["Tiene WhatsApp."],
  supuestos: ["Sin Google Business Profile confirmado."],
  quickWins: ["a", "b", "c"],
  puntajeGeneral: 50,
};

describe("renderFicha", () => {
  it("incluye nombre, contacto y marca (ficticio) cuando aplica", () => {
    const md = renderFicha(negocio);
    expect(md).toContain("Café La Parroquia");
    expect(md).toContain("(ficticio)");
    expect(md).toContain("+52 417 555 0101");
  });

  it("omite líneas de contacto que no existen", () => {
    const md = renderFicha({ ...negocio, whatsapp: undefined, sitio_web: undefined });
    expect(md).not.toContain("WhatsApp:");
  });
});

describe("renderDiagnostico", () => {
  it("incluye puntaje general, las 6 dimensiones, verificados/supuestos y 3 quick wins", () => {
    const md = renderDiagnostico(diagnostico);
    expect(md).toContain("50/100");
    for (const dimension of DIMENSIONES_DIAGNOSTICO) expect(md).toContain(dimension);
    expect(md).toContain("Tiene WhatsApp.");
    expect(md).toContain("Sin Google Business Profile confirmado.");
  });
});

describe("renderRecomendacion", () => {
  it("marca visiblemente un precio en hipótesis", () => {
    const recomendacion: Recomendacion = {
      negocioId: negocio.id,
      servicio: {
        id: "mapa-oportunidades",
        nombre: "Mapa de Oportunidades",
        precio_mxn: 4900,
        estado: "hipotesis",
      },
      justificacion: "x",
    };
    expect(renderRecomendacion(recomendacion)).toContain("hipótesis");
  });

  it("no marca nada extra si el precio ya está confirmado", () => {
    const recomendacion: Recomendacion = {
      negocioId: negocio.id,
      servicio: {
        id: "taller-operacion-digital",
        nombre: "Taller Operación Digital Productiva",
        precio_mxn: 9999,
        estado: "confirmado",
      },
      justificacion: "x",
    };
    expect(renderRecomendacion(recomendacion)).not.toContain("hipótesis");
  });
});

describe("renderContenido", () => {
  it("incluye las 3 publicaciones y sus hashtags", () => {
    const publicaciones: Publicaciones = [
      { red: "facebook", texto: "Post FB" },
      { red: "instagram", texto: "Post IG", hashtags: ["Acambaro"] },
      { red: "whatsapp_status", texto: "Status" },
    ];
    const md = renderContenido(publicaciones);
    expect(md).toContain("Post FB");
    expect(md).toContain("#Acambaro");
  });
});
