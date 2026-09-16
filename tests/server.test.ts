import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { crearServidor } from "../src/server.js";

async function conectarClienteYServidor() {
  const [transporteCliente, transporteServidor] = InMemoryTransport.createLinkedPair();
  const servidor = crearServidor();
  const cliente = new Client({ name: "test-client", version: "0.0.0" });

  await Promise.all([servidor.connect(transporteServidor), cliente.connect(transporteCliente)]);

  return { cliente, servidor };
}

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
