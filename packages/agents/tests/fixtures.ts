import {
  DIMENSIONES_DIAGNOSTICO,
  type Diagnostico,
  type Negocio,
  type Servicio,
} from "@acambaro/core";

export const negocioFixture: Negocio = {
  id: "cafe-la-parroquia",
  nombre: "Café La Parroquia",
  categoria: "cafeteria",
  descripcion:
    "Cafetería de barrio con pan dulce recién horneado y espacio para trabajar con wifi.",
  direccion: "Portal Hidalgo 12",
  colonia: "Centro",
  whatsapp: "+52 417 555 0101",
  horario: { lun: ["08:00-14:00"], dom: ["09:00-13:00"] },
  etiquetas: ["cafe", "wifi"],
  actualizado: "2026-01-12",
};

export const diagnosticoFixture: Diagnostico = {
  negocioId: negocioFixture.id,
  puntuaciones: DIMENSIONES_DIAGNOSTICO.map((dimension) => ({
    dimension,
    puntaje: 50,
    justificacion: `Justificación de ${dimension}.`,
  })),
  datosVerificados: ["Tiene WhatsApp registrado en la ficha."],
  supuestos: ["Se asume que no tiene Google Business Profile: no es un campo de la ficha."],
  quickWins: ["Publicar horario en redes", "Agregar WhatsApp visible", "Subir fotos recientes"],
  puntajeGeneral: 50,
};

export const serviciosFixture: Servicio[] = [
  { id: "diagnostico-expres", nombre: "Diagnóstico exprés", precio_mxn: 0, estado: "hipotesis" },
  {
    id: "taller-operacion-digital",
    nombre: "Taller Operación Digital Productiva",
    precio_mxn: 9999,
    estado: "confirmado",
  },
  {
    id: "mapa-oportunidades",
    nombre: "Mapa de Oportunidades",
    precio_mxn: 4900,
    estado: "hipotesis",
  },
];
