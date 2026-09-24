import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { obtenerCategorias, obtenerNegocios } from "../data/repo.js";

const ESCALERA_SDDA = `# Escalera de servicios SDDA

1. **Diagnóstico y arranque digital** (nivel bajo, 0-39 pts)
   Presencia básica: perfil de negocio, WhatsApp de contacto y ubicación en Google Maps.

2. **Acompañamiento digital** (nivel medio, 40-74 pts)
   Consolidar redes sociales, construir un sitio web propio y cuidar la reputación en línea.

3. **Optimización avanzada** (nivel alto, 75-100 pts)
   Publicidad digital, analítica de resultados y automatización de atención al cliente.

Cada nivel se calcula con la tool \`diagnostico_digital\`.
`;

export function registrarResources(server: McpServer): void {
  server.registerResource(
    "categorias",
    "directorio://categorias",
    {
      title: "Categorías del directorio",
      description: "Catálogo de categorías de negocios disponibles en el directorio de Acámbaro.",
      mimeType: "application/json",
    },
    (uri) => {
      const categorias = obtenerCategorias().map((categoria) => ({
        categoria,
        total: obtenerNegocios().filter((negocio) => negocio.categoria === categoria).length,
      }));

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ categorias }, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "servicios-sdda",
    "sdda://servicios",
    {
      title: "Escalera de servicios SDDA",
      description:
        "Los tres niveles de servicio de SDDA, vinculados al puntaje de diagnóstico_digital.",
      mimeType: "text/markdown",
    },
    (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: ESCALERA_SDDA,
        },
      ],
    }),
  );
}
