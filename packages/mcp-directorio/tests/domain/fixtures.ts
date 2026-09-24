import type { Negocio } from "../../src/domain/tipos.js";

export function crearNegocio(datos: Partial<Negocio> = {}): Negocio {
  return {
    id: "negocio-prueba",
    nombre: "Negocio de Prueba",
    categoria: "cafeteria",
    descripcion: "Un negocio ficticio usado solo para pruebas automatizadas.",
    direccion: "Calle Falsa 123",
    colonia: "Centro",
    horario: {
      lun: ["09:00-18:00"],
      mar: ["09:00-18:00"],
      mie: ["09:00-18:00"],
      jue: ["09:00-18:00"],
      vie: ["09:00-18:00"],
      sab: [],
      dom: [],
    },
    etiquetas: ["prueba"],
    actualizado: "2026-01-01",
    ...datos,
  };
}
