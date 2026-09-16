import negociosJson from "./negocios.json" with { type: "json" };
import type { Negocio } from "../domain/tipos.js";

const negocios = negociosJson as Negocio[];

export function obtenerNegocios(): Negocio[] {
  return negocios;
}

export function obtenerNegocioPorId(id: string): Negocio | undefined {
  return negocios.find((negocio) => negocio.id === id);
}

export function obtenerCategorias(): string[] {
  return [...new Set(negocios.map((negocio) => negocio.categoria))].sort();
}
