import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ConfigError } from "@acambaro/core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  cargarEstado,
  crearEstado,
  existeEstado,
  guardarEstado,
  rutaEstado,
} from "../src/estado.js";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "orchestrator-estado-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("crearEstado", () => {
  it("arranca sin pasos completados", () => {
    const estado = crearEstado({ negocioQuery: "cafe-la-parroquia", auto: false, dryRun: false });
    expect(estado.steps).toEqual({});
    expect(estado.negocioQuery).toBe("cafe-la-parroquia");
  });
});

describe("guardarEstado / cargarEstado", () => {
  it("hace round-trip completo", () => {
    const estado = crearEstado({
      manualPath: "samples/negocio-ejemplo.json",
      auto: true,
      dryRun: true,
    });
    guardarEstado(dir, estado);

    expect(existeEstado(dir)).toBe(true);
    const recargado = cargarEstado(dir);
    expect(recargado.manualPath).toBe("samples/negocio-ejemplo.json");
    expect(recargado.auto).toBe(true);
  });

  it("crea la carpeta de salida si no existe", () => {
    const sub = join(dir, "no-existe-todavia");
    guardarEstado(sub, crearEstado({ auto: false, dryRun: false }));
    expect(existeEstado(sub)).toBe(true);
  });

  it("existeEstado regresa false si no hay state.json", () => {
    expect(existeEstado(dir)).toBe(false);
  });

  it("lanza ConfigError si la carpeta de --resume no tiene state.json", () => {
    expect(() => cargarEstado(dir)).toThrow(ConfigError);
  });

  it("lanza ConfigError si state.json no tiene el formato esperado", () => {
    // Le faltan campos requeridos (auto, dryRun, createdAt, updatedAt, steps).
    writeFileSync(rutaEstado(dir), JSON.stringify({ version: 1 }), "utf-8");
    expect(() => cargarEstado(dir)).toThrow(ConfigError);
  });
});
