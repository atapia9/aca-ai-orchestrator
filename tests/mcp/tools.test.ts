import { describe, expect, it } from "vitest";
import { conectarClienteYServidor } from "../helpers/cliente-mcp.js";

describe("tool buscar_negocios", () => {
  it("encuentra negocios por texto libre sin importar acentos", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.callTool({ name: "buscar_negocios", arguments: { texto: "cafe" } });

    const negocios = (resultado.structuredContent as { negocios: { id: string }[] }).negocios;
    expect(negocios.map((n) => n.id)).toContain("cafe-la-parroquia");
  });

  it("filtra por categoría y colonia combinadas", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.callTool({
      name: "buscar_negocios",
      arguments: { categoria: "ferreteria", colonia: "Centro" },
    });

    const salida = resultado.structuredContent as { total: number; negocios: { id: string }[] };
    expect(salida.total).toBe(1);
    expect(salida.negocios[0].id).toBe("ferreteria-el-tornillo-feliz");
  });

  it("regresa una lista vacía cuando no hay coincidencias", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.callTool({
      name: "buscar_negocios",
      arguments: { texto: "esto-no-existe-en-ningun-negocio" },
    });

    expect(resultado.structuredContent).toEqual({ total: 0, negocios: [] });
  });
});

describe("tool detalle_negocio", () => {
  it("regresa la ficha completa de un negocio existente", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.callTool({ name: "detalle_negocio", arguments: { id: "cafe-la-parroquia" } });

    const negocio = resultado.structuredContent as { nombre: string; colonia: string };
    expect(negocio.nombre).toBe("Café La Parroquia");
    expect(negocio.colonia).toBe("Centro");
  });

  it("regresa un error claro cuando el id no existe", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.callTool({ name: "detalle_negocio", arguments: { id: "no-existe" } });

    expect(resultado.isError).toBe(true);
    expect((resultado.content as { type: string; text: string }[])[0].text).toMatch(/no se encontró/i);
  });
});

describe("tool negocios_abiertos", () => {
  it("lista solo los negocios abiertos en el día y hora indicados", async () => {
    const { cliente } = await conectarClienteYServidor();

    // cafe-la-parroquia abre lun 08:00-14:00; aroma-de-acambaro está cerrado los lunes.
    const resultado = await cliente.callTool({
      name: "negocios_abiertos",
      arguments: { dia: "lun", hora: "10:00" },
    });

    const negocios = (resultado.structuredContent as { negocios: { id: string }[] }).negocios;
    const ids = negocios.map((n) => n.id);
    expect(ids).toContain("cafe-la-parroquia");
    expect(ids).not.toContain("aroma-de-acambaro");
  });

  it("rechaza una hora con formato inválido", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.callTool({
      name: "negocios_abiertos",
      arguments: { dia: "lun", hora: "25:99" },
    });

    expect(resultado.isError).toBe(true);
  });
});

describe("tool diagnostico_digital", () => {
  it("da puntaje 100 y nivel alto a un negocio con presencia digital completa", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.callTool({
      name: "diagnostico_digital",
      arguments: { id: "cafe-la-parroquia" },
    });

    const diagnostico = resultado.structuredContent as { puntaje: number; nivel: string; servicio_sugerido: string };
    expect(diagnostico.puntaje).toBe(100);
    expect(diagnostico.nivel).toBe("alto");
    expect(diagnostico.servicio_sugerido).toMatch(/optimización avanzada/i);
  });

  it("da un puntaje bajo a un negocio sin presencia digital", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.callTool({
      name: "diagnostico_digital",
      arguments: { id: "ferreteria-el-tornillo-feliz" },
    });

    const diagnostico = resultado.structuredContent as { puntaje: number; nivel: string };
    expect(diagnostico.puntaje).toBe(20);
    expect(diagnostico.nivel).toBe("bajo");
  });

  it("regresa un error claro cuando el id no existe", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.callTool({ name: "diagnostico_digital", arguments: { id: "no-existe" } });

    expect(resultado.isError).toBe(true);
  });
});
