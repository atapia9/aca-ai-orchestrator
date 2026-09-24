import { describe, expect, it } from "vitest";
import { parsearArgumentos } from "../src/argumentos.js";

describe("parsearArgumentos", () => {
  it("acepta --negocio", () => {
    const opciones = parsearArgumentos(["diagnostico", "--negocio", "cafe-la-parroquia"]);
    expect(opciones).toMatchObject({ negocio: "cafe-la-parroquia", auto: false, dryRun: false });
  });

  it("acepta --manual, --auto y --dry-run juntos", () => {
    const opciones = parsearArgumentos([
      "diagnostico",
      "--manual",
      "samples/negocio-ejemplo.json",
      "--auto",
      "--dry-run",
    ]);
    expect(opciones).toMatchObject({
      manual: "samples/negocio-ejemplo.json",
      auto: true,
      dryRun: true,
    });
  });

  it("acepta --resume", () => {
    const opciones = parsearArgumentos(["diagnostico", "--resume", "output/2026-09-24-cafe"]);
    expect(opciones.resume).toBe("output/2026-09-24-cafe");
  });

  it("rechaza un subcomando distinto de diagnostico", () => {
    expect(() => parsearArgumentos(["eval"])).toThrow(/Comando desconocido/);
  });

  it("rechaza si no se pasa ninguno de --negocio/--manual/--resume", () => {
    expect(() => parsearArgumentos(["diagnostico", "--auto"])).toThrow(/exactamente una/);
  });

  it("rechaza si se pasa más de uno de --negocio/--manual/--resume", () => {
    expect(() =>
      parsearArgumentos(["diagnostico", "--negocio", "x", "--manual", "y.json"]),
    ).toThrow(/exactamente una/);
  });
});
