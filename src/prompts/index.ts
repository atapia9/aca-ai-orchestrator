import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { obtenerNegocioPorId } from "../data/repo.js";
import { diagnosticarNegocio } from "../domain/diagnostico.js";

export function registrarPrompts(server: McpServer): void {
  server.registerPrompt(
    "recomendar_negocio",
    {
      title: "Recomendar negocio",
      description: "Guía al modelo para recomendar negocios del directorio según lo que necesita el usuario.",
      argsSchema: {
        necesidad: z.string().min(1).describe("Qué necesita o busca el usuario, en sus propias palabras."),
        colonia: z.string().min(1).optional().describe("Colonia preferida del usuario, si la mencionó."),
      },
    },
    ({ necesidad, colonia }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Un usuario del directorio de Acámbaro busca: "${necesidad}"${colonia ? ` en la colonia ${colonia}` : ""}.`,
              "Usa la tool `buscar_negocios` para encontrar opciones relevantes (puedes combinar texto, categoría, colonia y abierto_ahora).",
              "Prioriza negocios abiertos ahora cuando el usuario no especifique lo contrario.",
              "Recomienda entre 1 y 3 negocios, explicando brevemente por qué cada uno encaja con lo que pide.",
              "Si no hay resultados, sugiere ampliar la búsqueda (otra colonia o categoría relacionada) en vez de inventar negocios.",
            ].join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "propuesta_sdda",
    {
      title: "Propuesta SDDA",
      description: "Genera un borrador de propuesta comercial de SDDA para un negocio, según su diagnóstico digital.",
      argsSchema: {
        id: z.string().min(1).describe("Id (slug) del negocio, por ejemplo 'cafe-la-parroquia'."),
      },
    },
    ({ id }) => {
      const negocio = obtenerNegocioPorId(id);
      if (!negocio) {
        throw new Error(`No se encontró ningún negocio con id "${id}".`);
      }

      const diagnostico = diagnosticarNegocio(negocio);
      const factoresFaltantes = diagnostico.factores
        .filter((factor) => !factor.cumplido)
        .map((factor) => `- ${factor.nombre}`)
        .join("\n");

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Redacta un borrador de propuesta comercial de SDDA (Servicios Digitales de Acámbaro) para "${negocio.nombre}".`,
                `Diagnóstico actual: ${diagnostico.puntaje}/100 (nivel ${diagnostico.nivel}).`,
                `Servicio sugerido: ${diagnostico.servicioSugerido}`,
                factoresFaltantes
                  ? `Factores de presencia digital que le faltan por cubrir:\n${factoresFaltantes}`
                  : "El negocio ya cumple todos los factores evaluados; enfoca la propuesta en optimización avanzada.",
                "La propuesta debe ser breve (máximo 200 palabras), en español, tono profesional y cercano, y explicar el beneficio concreto de cada punto para el negocio.",
              ].join("\n\n"),
            },
          },
        ],
      };
    },
  );
}
