import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { registrarPrompts } from "./prompts/index.js";
import { registrarResources } from "./resources/index.js";
import { registrarTools } from "./tools/index.js";

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

  registrarTools(server);
  registrarResources(server);
  registrarPrompts(server);

  return server;
}
