import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buscarServicio, cargarEscaleraServicios } from "../../src/config/servicios.js";
import { ConfigError } from "../../src/errors.js";

const RUTA_YAML_REAL = join(import.meta.dirname, "../../../../config/sdda-servicios.yaml");

const archivosTemporales: string[] = [];
function archivoTemporal(contenido: string): string {
  const ruta = join(tmpdir(), `servicios-${Date.now()}-${Math.random()}.yaml`);
  writeFileSync(ruta, contenido, "utf-8");
  archivosTemporales.push(ruta);
  return ruta;
}

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(archivosTemporales.splice(0).map((ruta) => rm(ruta, { force: true })));
});

describe("cargarEscaleraServicios", () => {
  it("carga y valida el YAML real del monorepo", () => {
    const servicios = cargarEscaleraServicios(RUTA_YAML_REAL);
    expect(servicios.length).toBeGreaterThanOrEqual(5);
    expect(servicios.map((s) => s.id)).toContain("taller-operacion-digital");
  });

  it("marca el taller como confirmado y el resto como hipotesis", () => {
    const servicios = cargarEscaleraServicios(RUTA_YAML_REAL);
    const taller = buscarServicio(servicios, "taller-operacion-digital");
    expect(taller?.estado).toBe("confirmado");
    const otros = servicios.filter((s) => s.id !== "taller-operacion-digital");
    expect(otros.every((s) => s.estado === "hipotesis")).toBe(true);
  });

  it("lanza ConfigError si el archivo no existe", () => {
    expect(() => cargarEscaleraServicios("/ruta/que/no/existe.yaml")).toThrow(ConfigError);
  });

  it("lanza ConfigError si el YAML es inválido", () => {
    const ruta = archivoTemporal("esto: no\n  esta: - bien indentado: :");
    expect(() => cargarEscaleraServicios(ruta)).toThrow(ConfigError);
  });

  it("lanza ConfigError si no cumple el schema (falta id)", () => {
    const ruta = archivoTemporal(
      "servicios:\n  - nombre: Sin id\n    precio_mxn: 100\n    estado: confirmado\n",
    );
    expect(() => cargarEscaleraServicios(ruta)).toThrow(ConfigError);
  });
});

describe("buscarServicio", () => {
  it("regresa undefined si el id no existe", () => {
    const servicios = cargarEscaleraServicios(RUTA_YAML_REAL);
    expect(buscarServicio(servicios, "no-existe")).toBeUndefined();
  });
});
