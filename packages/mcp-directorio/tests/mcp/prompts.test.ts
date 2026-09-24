import { describe, expect, it } from "vitest";
import { conectarClienteYServidor } from "../helpers/cliente-mcp.js";

describe("prompt recomendar_negocio", () => {
  it("incluye la necesidad y la colonia del usuario en las instrucciones", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.getPrompt({
      name: "recomendar_negocio",
      arguments: { necesidad: "quiero desayunar algo rico", colonia: "Centro" },
    });

    const texto = (resultado.messages[0].content as { text: string }).text;
    expect(texto).toContain("quiero desayunar algo rico");
    expect(texto).toContain("Centro");
    expect(texto).toMatch(/buscar_negocios/);
  });
});

describe("prompt propuesta_sdda", () => {
  it("arma un borrador con el diagnóstico y los factores faltantes", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.getPrompt({
      name: "propuesta_sdda",
      arguments: { id: "ferreteria-el-tornillo-feliz" },
    });

    const texto = (resultado.messages[0].content as { text: string }).text;
    expect(texto).toContain("Ferretería El Tornillo Feliz");
    expect(texto).toContain("20/100");
    expect(texto).toMatch(/sitio web propio/i);
  });

  it("rechaza un id de negocio inexistente", async () => {
    const { cliente } = await conectarClienteYServidor();

    await expect(cliente.getPrompt({ name: "propuesta_sdda", arguments: { id: "no-existe" } })).rejects.toThrow();
  });
});
