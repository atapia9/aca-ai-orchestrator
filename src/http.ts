import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { crearServidor } from "./server.js";

const PUERTO = Number(process.env.PORT ?? 3000);
const TOKEN = process.env.MCP_TOKEN;

if (!TOKEN) {
  console.error("Falta la variable de entorno MCP_TOKEN: es obligatoria para exponer el servidor por HTTP.");
  process.exit(1);
}

function estaAutorizada(req: IncomingMessage): boolean {
  return req.headers.authorization === `Bearer ${TOKEN}`;
}

function responderJson(res: ServerResponse, status: number, cuerpo: unknown): void {
  res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(cuerpo));
}

async function manejarPeticionMcp(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!estaAutorizada(req)) {
    responderJson(res, 401, { error: "No autorizado." });
    return;
  }

  const server = crearServidor();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res);
}

const httpServer = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/salud") {
    res.writeHead(200, { "content-type": "text/plain" }).end("ok");
    return;
  }

  if (req.method === "POST" && req.url === "/mcp") {
    manejarPeticionMcp(req, res).catch((error: unknown) => {
      console.error("Error manejando petición MCP:", error);
      if (!res.headersSent) {
        responderJson(res, 500, { error: "Error interno del servidor." });
      }
    });
    return;
  }

  responderJson(res, 404, { error: "No encontrado." });
});

httpServer.listen(PUERTO, () => {
  console.error(`mcp-directorio-acambaro: servidor HTTP listo en el puerto ${PUERTO} (POST /mcp, GET /salud)`);
});
