import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { crearServidor } from "./server.js";

async function main(): Promise<void> {
  const server = crearServidor();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Nunca usar stdout en modo stdio: rompe el protocolo MCP.
  console.error("mcp-directorio-acambaro: servidor listo (stdio)");
}

main().catch((error: unknown) => {
  console.error("Error fatal al iniciar el servidor:", error);
  process.exit(1);
});
