import { estaAbiertoAhora } from "./horario.js";
import type { Negocio } from "./tipos.js";

export interface FiltrosBusqueda {
  texto?: string;
  categoria?: string;
  colonia?: string;
  abiertoAhora?: boolean;
  fechaReferencia?: Date;
}

export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function coincideTexto(negocio: Negocio, texto: string): boolean {
  const consulta = normalizarTexto(texto);
  const campos = [
    negocio.nombre,
    negocio.descripcion,
    negocio.categoria,
    ...negocio.etiquetas,
  ];
  return campos.some((campo) => normalizarTexto(campo).includes(consulta));
}

export function buscarNegocios(negocios: Negocio[], filtros: FiltrosBusqueda = {}): Negocio[] {
  return negocios.filter((negocio) => {
    if (filtros.texto && !coincideTexto(negocio, filtros.texto)) {
      return false;
    }
    if (filtros.categoria && normalizarTexto(negocio.categoria) !== normalizarTexto(filtros.categoria)) {
      return false;
    }
    if (filtros.colonia && normalizarTexto(negocio.colonia) !== normalizarTexto(filtros.colonia)) {
      return false;
    }
    if (filtros.abiertoAhora && !estaAbiertoAhora(negocio, filtros.fechaReferencia)) {
      return false;
    }
    return true;
  });
}
