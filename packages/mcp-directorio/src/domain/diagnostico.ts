import type { Negocio } from "./tipos.js";

export interface FactorDiagnostico {
  nombre: string;
  cumplido: boolean;
  puntos: number;
}

export type NivelDigital = "bajo" | "medio" | "alto";

export interface DiagnosticoDigital {
  puntaje: number;
  nivel: NivelDigital;
  factores: FactorDiagnostico[];
  servicioSugerido: string;
}

const DESCRIPCION_MINIMA = 40;

function evaluarFactores(negocio: Negocio): FactorDiagnostico[] {
  return [
    { nombre: "Sitio web propio", cumplido: Boolean(negocio.sitio_web), puntos: 25 },
    { nombre: "WhatsApp de contacto", cumplido: Boolean(negocio.whatsapp), puntos: 20 },
    {
      nombre: "Presencia en redes sociales",
      cumplido: Boolean(negocio.redes?.facebook || negocio.redes?.instagram),
      puntos: 20,
    },
    { nombre: "Ubicación en Google Maps", cumplido: Boolean(negocio.redes?.google_maps), puntos: 15 },
    { nombre: "Teléfono de contacto", cumplido: Boolean(negocio.telefono), puntos: 10 },
    {
      nombre: "Descripción con contenido suficiente",
      cumplido: negocio.descripcion.trim().length >= DESCRIPCION_MINIMA,
      puntos: 10,
    },
  ];
}

function nivelDesdePuntaje(puntaje: number): NivelDigital {
  if (puntaje >= 75) return "alto";
  if (puntaje >= 40) return "medio";
  return "bajo";
}

function servicioSdaSugerido(nivel: NivelDigital): string {
  switch (nivel) {
    case "bajo":
      return "Diagnóstico y arranque digital SDDA: presencia básica (perfil, WhatsApp, ubicación).";
    case "medio":
      return "Acompañamiento digital SDDA: consolidar redes, sitio web y reputación en línea.";
    case "alto":
      return "Optimización avanzada SDDA: publicidad digital, analítica y automatización.";
  }
}

export function diagnosticarNegocio(negocio: Negocio): DiagnosticoDigital {
  const factores = evaluarFactores(negocio);
  const puntaje = factores.reduce((total, factor) => total + (factor.cumplido ? factor.puntos : 0), 0);
  const nivel = nivelDesdePuntaje(puntaje);

  return {
    puntaje,
    nivel,
    factores,
    servicioSugerido: servicioSdaSugerido(nivel),
  };
}
