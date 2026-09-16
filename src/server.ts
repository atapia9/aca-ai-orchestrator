import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Instancia central del servidor: aquí se registran tools, resources y prompts.
export function crearServidor(): McpServer {
  const server = new McpServer({
    name: "mcp-directorio-acambaro",
    version: "0.1.0",
  });

  server.registerTool(
    "ping",
    {
      title: "Ping",
      description: "Tool de prueba: responde 'pong' para verificar que el servidor funciona.",
      inputSchema: {},
      outputSchema: { mensaje: z.string() },
    },
    () => ({
      content: [{ type: "text", text: "pong" }],
      structuredContent: { mensaje: "pong" },
    }),
  );

  return server;
}
