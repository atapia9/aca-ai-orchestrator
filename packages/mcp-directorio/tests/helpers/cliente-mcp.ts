import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { crearServidor } from "../../src/server.js";

export async function conectarClienteYServidor() {
  const [transporteCliente, transporteServidor] = InMemoryTransport.createLinkedPair();
  const servidor = crearServidor();
  const cliente = new Client({ name: "test-client", version: "0.0.0" });

  await Promise.all([servidor.connect(transporteServidor), cliente.connect(transporteCliente)]);

  return { cliente, servidor };
}
