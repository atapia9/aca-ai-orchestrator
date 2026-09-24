import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  busquedaResultadoSchema,
  categoriaSchema,
  diagnosticoDigitalSchema,
  negocioDetalleSchema,
  type BusquedaResultado,
  type Categoria,
  type Dia,
  type DiagnosticoDigital,
  type NegocioDetalle,
} from "./schemas.js";

export interface FiltrosBusqueda {
  texto?: string;
  categoria?: string;
  colonia?: string;
  abiertoAhora?: boolean;
}

export interface DirectorioClientOptions {
  /** Ruta absoluta al entry point del servidor (dist/index.js). Por defecto se resuelve el paquete `mcp-directorio-acambaro`. */
  serverPath?: string;
}

/**
 * Cliente tipado hacia el MCP del directorio de negocios de Acámbaro.
 * Levanta el servidor como proceso hijo y habla con él por stdio.
 */
export class DirectorioClient {
  private constructor(
    private readonly client: Client,
    private readonly transport: StdioClientTransport,
  ) {}

  static async connect(options: DirectorioClientOptions = {}): Promise<DirectorioClient> {
    const serverPath = options.serverPath ?? resolveDefaultServerPath();
    if (!existsSync(serverPath)) {
      throw new Error(
        `No se encontró el servidor compilado en "${serverPath}". ` +
          "Corre `pnpm --filter mcp-directorio-acambaro build` (o `pnpm build` en la raíz) antes de usar DirectorioClient.",
      );
    }
    const transport = new StdioClientTransport({ command: "node", args: [serverPath] });
    const client = new Client({ name: "acambaro-orchestrator", version: "0.1.0" });
    await client.connect(transport);
    return new DirectorioClient(client, transport);
  }

  async close(): Promise<void> {
    await this.transport.close();
  }

  async buscarNegocios(filtros: FiltrosBusqueda = {}): Promise<BusquedaResultado> {
    const salida = await this.llamarTool("buscar_negocios", {
      texto: filtros.texto,
      categoria: filtros.categoria,
      colonia: filtros.colonia,
      abierto_ahora: filtros.abiertoAhora,
    });
    return busquedaResultadoSchema.parse(salida);
  }

  async detalleNegocio(id: string): Promise<NegocioDetalle> {
    const salida = await this.llamarTool("detalle_negocio", { id });
    return negocioDetalleSchema.parse(salida);
  }

  async negociosAbiertos(dia: Dia, hora: string): Promise<BusquedaResultado> {
    const salida = await this.llamarTool("negocios_abiertos", { dia, hora });
    return busquedaResultadoSchema.parse(salida);
  }

  async diagnosticoDigital(id: string): Promise<DiagnosticoDigital> {
    const salida = await this.llamarTool("diagnostico_digital", { id });
    return diagnosticoDigitalSchema.parse(salida);
  }

  async categorias(): Promise<Categoria[]> {
    const resultado = await this.client.readResource({ uri: "directorio://categorias" });
    const primero = resultado.contents[0];
    if (!primero || !("text" in primero)) {
      throw new Error("El resource directorio://categorias no regresó contenido de texto.");
    }
    const datos: unknown = JSON.parse(primero.text).categorias;
    return categoriaSchema.array().parse(datos);
  }

  /** Llama una tool y regresa su structuredContent, o lanza si la tool reportó error. */
  private async llamarTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const resultado = await this.client.callTool({ name, arguments: args });
    if (!("structuredContent" in resultado)) {
      throw new Error(
        `La tool "${name}" no regresó structuredContent (resultado en formato legado).`,
      );
    }
    if (resultado.isError) {
      throw new Error(`La tool "${name}" regresó un error.`);
    }
    return resultado.structuredContent;
  }
}

function resolveDefaultServerPath(): string {
  return createRequire(import.meta.url).resolve("mcp-directorio-acambaro");
}
