import Database from "better-sqlite3";
import negociosJson from "./negocios.json" with { type: "json" };
import type { Negocio } from "../domain/tipos.js";

interface FilaNegocio {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  direccion: string;
  colonia: string;
  telefono: string | null;
  whatsapp: string | null;
  sitio_web: string | null;
  redes: string | null;
  horario: string;
  etiquetas: string;
  actualizado: string;
}

// Base en memoria: no hay escrituras en este MVP, así que negocios.json sigue
// siendo la única fuente de verdad y la base se reconstruye en cada arranque.
const db = new Database(":memory:");

db.exec(`
  CREATE TABLE negocios (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    direccion TEXT NOT NULL,
    colonia TEXT NOT NULL,
    telefono TEXT,
    whatsapp TEXT,
    sitio_web TEXT,
    redes TEXT,
    horario TEXT NOT NULL,
    etiquetas TEXT NOT NULL,
    actualizado TEXT NOT NULL
  )
`);

const insertar = db.prepare(`
  INSERT INTO negocios
    (id, nombre, categoria, descripcion, direccion, colonia, telefono, whatsapp, sitio_web, redes, horario, etiquetas, actualizado)
  VALUES
    (@id, @nombre, @categoria, @descripcion, @direccion, @colonia, @telefono, @whatsapp, @sitio_web, @redes, @horario, @etiquetas, @actualizado)
`);

const insertarTodos = db.transaction((filas: FilaNegocio[]) => {
  for (const fila of filas) insertar.run(fila);
});

insertarTodos(
  (negociosJson as Negocio[]).map((negocio) => ({
    id: negocio.id,
    nombre: negocio.nombre,
    categoria: negocio.categoria,
    descripcion: negocio.descripcion,
    direccion: negocio.direccion,
    colonia: negocio.colonia,
    telefono: negocio.telefono ?? null,
    whatsapp: negocio.whatsapp ?? null,
    sitio_web: negocio.sitio_web ?? null,
    redes: negocio.redes ? JSON.stringify(negocio.redes) : null,
    horario: JSON.stringify(negocio.horario),
    etiquetas: JSON.stringify(negocio.etiquetas),
    actualizado: negocio.actualizado,
  })),
);

function filaANegocio(fila: FilaNegocio): Negocio {
  return {
    id: fila.id,
    nombre: fila.nombre,
    categoria: fila.categoria,
    descripcion: fila.descripcion,
    direccion: fila.direccion,
    colonia: fila.colonia,
    telefono: fila.telefono ?? undefined,
    whatsapp: fila.whatsapp ?? undefined,
    sitio_web: fila.sitio_web ?? undefined,
    redes: fila.redes ? JSON.parse(fila.redes) : undefined,
    horario: JSON.parse(fila.horario),
    etiquetas: JSON.parse(fila.etiquetas),
    actualizado: fila.actualizado,
  };
}

const selectTodos = db.prepare("SELECT * FROM negocios ORDER BY nombre");
const selectPorId = db.prepare("SELECT * FROM negocios WHERE id = ?");
const selectCategorias = db.prepare("SELECT DISTINCT categoria FROM negocios ORDER BY categoria");

export function obtenerNegocios(): Negocio[] {
  return (selectTodos.all() as FilaNegocio[]).map(filaANegocio);
}

export function obtenerNegocioPorId(id: string): Negocio | undefined {
  const fila = selectPorId.get(id) as FilaNegocio | undefined;
  return fila ? filaANegocio(fila) : undefined;
}

export function obtenerCategorias(): string[] {
  return (selectCategorias.all() as { categoria: string }[]).map((fila) => fila.categoria);
}
