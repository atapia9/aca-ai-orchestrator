import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DirectorioClient } from "../src/client.js";

// Test de integracion real: levanta packages/mcp-directorio como proceso hijo
// por stdio (requiere que ya este compilado, ver src/client.ts) y hace
// consultas reales contra su seed ficticio - sin mocks del protocolo MCP.
describe("DirectorioClient (integración stdio)", () => {
  let cliente: DirectorioClient;

  beforeAll(async () => {
    cliente = await DirectorioClient.connect();
  });

  afterAll(async () => {
    await cliente.close();
  });

  it("busca negocios por categoría", async () => {
    const resultado = await cliente.buscarNegocios({ categoria: "cafeteria" });
    expect(resultado.total).toBeGreaterThan(0);
    expect(resultado.negocios.every((n) => n.categoria === "cafeteria")).toBe(true);
  });

  it("obtiene el detalle de un negocio conocido del seed", async () => {
    const detalle = await cliente.detalleNegocio("cafe-la-parroquia");
    expect(detalle.id).toBe("cafe-la-parroquia");
    expect(detalle.nombre).toBe("Café La Parroquia");
    expect(typeof detalle.abierto_ahora).toBe("boolean");
  });

  it("lanza un error claro si el negocio no existe", async () => {
    await expect(cliente.detalleNegocio("no-existe-este-id")).rejects.toThrow();
  });

  it("calcula el diagnóstico digital de un negocio", async () => {
    const diagnostico = await cliente.diagnosticoDigital("cafe-la-parroquia");
    expect(diagnostico.puntaje).toBeGreaterThanOrEqual(0);
    expect(diagnostico.puntaje).toBeLessThanOrEqual(100);
    expect(["bajo", "medio", "alto"]).toContain(diagnostico.nivel);
    expect(diagnostico.factores.length).toBeGreaterThan(0);
  });

  it("lista las categorías del directorio vía resource", async () => {
    const categorias = await cliente.categorias();
    expect(categorias.length).toBeGreaterThan(0);
    expect(categorias.some((c) => c.categoria === "cafeteria")).toBe(true);
  });
});
