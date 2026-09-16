import { describe, expect, it } from "vitest";
import { conectarClienteYServidor } from "./helpers/cliente-mcp.js";

describe("servidor MCP", () => {
  it("responde 'pong' al invocar el tool ping", async () => {
    const { cliente } = await conectarClienteYServidor();

    const resultado = await cliente.callTool({ name: "ping", arguments: {} });

    expect(resultado.structuredContent).toEqual({ mensaje: "pong" });
    expect(resultado.content).toEqual([{ type: "text", text: "pong" }]);
  });

  it("expone el tool ping en la lista de tools", async () => {
    const { cliente } = await conectarClienteYServidor();

    const { tools } = await cliente.listTools();

    expect(tools.map((tool) => tool.name)).toContain("ping");
  });
});
