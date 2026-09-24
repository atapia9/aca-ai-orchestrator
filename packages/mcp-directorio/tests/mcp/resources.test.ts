import { describe, expect, it } from "vitest";
import { conectarClienteYServidor } from "../helpers/cliente-mcp.js";

describe("resource directorio://categorias", () => {
  it("regresa el catálogo de categorías con al menos 6 categorías", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.readResource({ uri: "directorio://categorias" });

    expect(resultado.contents[0].mimeType).toBe("application/json");
    const datos = JSON.parse(resultado.contents[0].text as string) as {
      categorias: { categoria: string; total: number }[];
    };
    expect(datos.categorias.length).toBeGreaterThanOrEqual(6);
    expect(datos.categorias.map((c) => c.categoria)).toContain("cafeteria");
  });
});

describe("resource sdda://servicios", () => {
  it("describe los tres niveles de la escalera de servicios SDDA", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.readResource({ uri: "sdda://servicios" });

    expect(resultado.contents[0].mimeType).toBe("text/markdown");
    const texto = resultado.contents[0].text as string;
    expect(texto).toMatch(/diagnóstico y arranque digital/i);
    expect(texto).toMatch(/acompañamiento digital/i);
    expect(texto).toMatch(/optimización avanzada/i);
  });
});
