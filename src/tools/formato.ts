import { estaAbiertoAhora } from "../domain/horario.js";
import type { Negocio } from "../domain/tipos.js";

export function resumenNegocio(negocio: Negocio) {
  return {
    id: negocio.id,
    nombre: negocio.nombre,
    categoria: negocio.categoria,
    colonia: negocio.colonia,
    abierto_ahora: estaAbiertoAhora(negocio),
  };
}

export function lineaResumen(negocio: Negocio): string {
  const estado = estaAbiertoAhora(negocio) ? "abierto ahora" : "cerrado ahora";
  return `- ${negocio.nombre} (${negocio.categoria}, ${negocio.colonia}) — ${estado}`;
}

export function fichaCompleta(negocio: Negocio): string {
  const lineas = [
    `${negocio.nombre} (${negocio.id})`,
    negocio.descripcion,
    `Categoría: ${negocio.categoria} · Colonia: ${negocio.colonia}`,
    `Dirección: ${negocio.direccion}`,
  ];
  if (negocio.telefono) lineas.push(`Teléfono: ${negocio.telefono}`);
  if (negocio.whatsapp) lineas.push(`WhatsApp: ${negocio.whatsapp}`);
  if (negocio.sitio_web) lineas.push(`Sitio web: ${negocio.sitio_web}`);
  if (negocio.redes?.facebook) lineas.push(`Facebook: ${negocio.redes.facebook}`);
  if (negocio.redes?.instagram) lineas.push(`Instagram: ${negocio.redes.instagram}`);
  if (negocio.redes?.google_maps) lineas.push(`Google Maps: ${negocio.redes.google_maps}`);
  lineas.push(estaAbiertoAhora(negocio) ? "Estado: abierto ahora" : "Estado: cerrado ahora");
  return lineas.join("\n");
}
