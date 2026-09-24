import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { obtenerNegocioPorId, obtenerNegocios } from "../data/repo.js";
import { buscarNegocios } from "../domain/busqueda.js";
import { diagnosticarNegocio } from "../domain/diagnostico.js";
import { estaAbiertoAhora, negociosAbiertosEn } from "../domain/horario.js";
import { DIAS } from "../domain/tipos.js";
import { fichaCompleta, lineaResumen, resumenNegocio } from "./formato.js";

const resumenSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  categoria: z.string(),
  colonia: z.string(),
  abierto_ahora: z.boolean(),
});

export function registrarTools(server: McpServer): void {
  server.registerTool(
    "buscar_negocios",
    {
      title: "Buscar negocios",
      description:
        "Busca negocios del directorio de Acámbaro por texto libre, categoría, colonia y/o si están abiertos ahora.",
      inputSchema: {
        texto: z
          .string()
          .min(1)
          .optional()
          .describe(
            "Texto libre a buscar en nombre, descripción, categoría o etiquetas (sin distinguir acentos).",
          ),
        categoria: z
          .string()
          .min(1)
          .optional()
          .describe("Categoría exacta, por ejemplo 'cafeteria'."),
        colonia: z.string().min(1).optional().describe("Colonia exacta, por ejemplo 'Centro'."),
        abierto_ahora: z
          .boolean()
          .optional()
          .describe("Si es true, solo regresa negocios abiertos en este momento."),
      },
      outputSchema: {
        total: z.number(),
        negocios: z.array(resumenSchema),
      },
    },
    ({ texto, categoria, colonia, abierto_ahora }) => {
      const resultados = buscarNegocios(obtenerNegocios(), {
        texto,
        categoria,
        colonia,
        abiertoAhora: abierto_ahora,
      });

      const texto_resultado =
        resultados.length === 0
          ? "No se encontraron negocios con esos criterios."
          : resultados.map(lineaResumen).join("\n");

      return {
        content: [{ type: "text", text: texto_resultado }],
        structuredContent: {
          total: resultados.length,
          negocios: resultados.map(resumenNegocio),
        },
      };
    },
  );

  server.registerTool(
    "detalle_negocio",
    {
      title: "Detalle de negocio",
      description: "Regresa la ficha completa de un negocio: horario, contacto, redes y sitio web.",
      inputSchema: {
        id: z.string().min(1).describe("Id (slug) del negocio, por ejemplo 'cafe-la-parroquia'."),
      },
      outputSchema: {
        id: z.string(),
        nombre: z.string(),
        categoria: z.string(),
        descripcion: z.string(),
        direccion: z.string(),
        colonia: z.string(),
        telefono: z.string().optional(),
        whatsapp: z.string().optional(),
        sitio_web: z.string().optional(),
        redes: z
          .object({
            facebook: z.string().optional(),
            instagram: z.string().optional(),
            google_maps: z.string().optional(),
          })
          .optional(),
        horario: z.record(z.string(), z.array(z.string())),
        etiquetas: z.array(z.string()),
        actualizado: z.string(),
        abierto_ahora: z.boolean(),
      },
    },
    ({ id }) => {
      const negocio = obtenerNegocioPorId(id);
      if (!negocio) {
        throw new Error(`No se encontró ningún negocio con id "${id}".`);
      }

      return {
        content: [{ type: "text", text: fichaCompleta(negocio) }],
        structuredContent: { ...negocio, abierto_ahora: estaAbiertoAhora(negocio) },
      };
    },
  );

  server.registerTool(
    "negocios_abiertos",
    {
      title: "Negocios abiertos",
      description:
        "Lista los negocios abiertos en un día y hora determinados (hora de Ciudad de México).",
      inputSchema: {
        dia: z
          .enum(DIAS as [string, ...string[]])
          .describe("Día de la semana: lun, mar, mie, jue, vie, sab o dom."),
        hora: z
          .string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
          .describe("Hora en formato 24h HH:MM, por ejemplo '14:30'."),
      },
      outputSchema: {
        total: z.number(),
        negocios: z.array(resumenSchema),
      },
    },
    ({ dia, hora }) => {
      const resultados = negociosAbiertosEn(obtenerNegocios(), dia as (typeof DIAS)[number], hora);

      const texto_resultado =
        resultados.length === 0
          ? `Ningún negocio está abierto el ${dia} a las ${hora}.`
          : resultados.map(lineaResumen).join("\n");

      return {
        content: [{ type: "text", text: texto_resultado }],
        structuredContent: {
          total: resultados.length,
          negocios: resultados.map(resumenNegocio),
        },
      };
    },
  );

  server.registerTool(
    "diagnostico_digital",
    {
      title: "Diagnóstico digital",
      description:
        "Calcula un puntaje 0-100 de presencia digital de un negocio y sugiere el servicio SDDA correspondiente.",
      inputSchema: {
        id: z.string().min(1).describe("Id (slug) del negocio, por ejemplo 'cafe-la-parroquia'."),
      },
      outputSchema: {
        id: z.string(),
        nombre: z.string(),
        puntaje: z.number(),
        nivel: z.enum(["bajo", "medio", "alto"]),
        factores: z.array(
          z.object({
            nombre: z.string(),
            cumplido: z.boolean(),
            puntos: z.number(),
          }),
        ),
        servicio_sugerido: z.string(),
      },
    },
    ({ id }) => {
      const negocio = obtenerNegocioPorId(id);
      if (!negocio) {
        throw new Error(`No se encontró ningún negocio con id "${id}".`);
      }

      const diagnostico = diagnosticarNegocio(negocio);
      const detalleFactores = diagnostico.factores
        .map(
          (factor) => `  ${factor.cumplido ? "✅" : "❌"} ${factor.nombre} (${factor.puntos} pts)`,
        )
        .join("\n");
      const texto_resultado = [
        `${negocio.nombre}: ${diagnostico.puntaje}/100 (nivel ${diagnostico.nivel})`,
        detalleFactores,
        `Servicio sugerido: ${diagnostico.servicioSugerido}`,
      ].join("\n");

      return {
        content: [{ type: "text", text: texto_resultado }],
        structuredContent: {
          id: negocio.id,
          nombre: negocio.nombre,
          puntaje: diagnostico.puntaje,
          nivel: diagnostico.nivel,
          factores: diagnostico.factores,
          servicio_sugerido: diagnostico.servicioSugerido,
        },
      };
    },
  );
}
