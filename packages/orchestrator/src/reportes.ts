import type { Diagnostico, Negocio, Publicaciones, Recomendacion } from "@acambaro/core";

export function renderFicha(negocio: Negocio): string {
  const lineas = [
    `# Ficha: ${negocio.nombre}${negocio.ficticio ? " (ficticio)" : ""}`,
    "",
    `**Categoría:** ${negocio.categoria}  `,
    `**Colonia:** ${negocio.colonia}  `,
    `**Dirección:** ${negocio.direccion}`,
    "",
    negocio.descripcion,
    "",
    "## Contacto",
    negocio.telefono ? `- Teléfono: ${negocio.telefono}` : undefined,
    negocio.whatsapp ? `- WhatsApp: ${negocio.whatsapp}` : undefined,
    negocio.sitio_web ? `- Sitio web: ${negocio.sitio_web}` : undefined,
    negocio.redes?.facebook ? `- Facebook: ${negocio.redes.facebook}` : undefined,
    negocio.redes?.instagram ? `- Instagram: ${negocio.redes.instagram}` : undefined,
    negocio.redes?.google_maps ? `- Google Maps: ${negocio.redes.google_maps}` : undefined,
    "",
    `**Etiquetas:** ${negocio.etiquetas.join(", ") || "—"}`,
    `**Última actualización:** ${negocio.actualizado}`,
  ];
  return lineas.filter((l) => l !== undefined).join("\n");
}

export function renderDiagnostico(diagnostico: Diagnostico): string {
  const lineas = [
    `# Diagnóstico de presencia digital`,
    "",
    `**Puntaje general: ${diagnostico.puntajeGeneral}/100**`,
    "",
    "## Por dimensión",
    ...diagnostico.puntuaciones.map(
      (p) => `- **${p.dimension}**: ${p.puntaje}/100 — ${p.justificacion}`,
    ),
    "",
    "## Datos verificados",
    ...diagnostico.datosVerificados.map((d) => `- ${d}`),
    "",
    "## Supuestos (no confirmados con los datos disponibles)",
    ...diagnostico.supuestos.map((s) => `- ${s}`),
    "",
    "## Quick wins",
    ...diagnostico.quickWins.map((q, i) => `${i + 1}. ${q}`),
  ];
  return lineas.join("\n");
}

export function renderRecomendacion(recomendacion: Recomendacion): string {
  const { servicio } = recomendacion;
  const nota =
    servicio.estado === "hipotesis" ? " _(precio en hipótesis, sujeto a validación)_" : "";
  const precio =
    servicio.precio_mxn === 0
      ? "Sin costo"
      : `$${servicio.precio_mxn.toLocaleString("es-MX")} MXN${servicio.periodicidad ? `/${servicio.periodicidad}` : ""}`;
  return [
    `# Servicio recomendado: ${servicio.nombre}`,
    "",
    `**Precio:** ${precio}${nota}`,
    "",
    "## Justificación",
    recomendacion.justificacion,
  ].join("\n");
}

export function renderContenido(publicaciones: Publicaciones): string {
  const lineas = ["# Publicaciones de redes sociales", ""];
  for (const pub of publicaciones) {
    lineas.push(`## ${pub.red}`, "", pub.texto);
    if (pub.hashtags?.length) {
      lineas.push("", pub.hashtags.map((h) => `#${h}`).join(" "));
    }
    lineas.push("");
  }
  return lineas.join("\n").trimEnd();
}
