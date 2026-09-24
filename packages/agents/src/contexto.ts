import type { LLMProvider, Servicio } from "@acambaro/core";

export interface CandidatoNegocio {
  id: string;
  nombre: string;
  categoria: string;
  colonia: string;
}

/**
 * Lo mínimo que un agente necesita del directorio. DirectorioClient
 * (@acambaro/mcp-client) satisface esta interfaz estructuralmente; se
 * declara aquí, en vez de importar la clase concreta, para que los tests
 * de agentes puedan usar un objeto plano sin levantar el servidor MCP real.
 */
export interface DirectorioConsulta {
  detalleNegocio(id: string): Promise<unknown>;
  buscarNegocios(filtros: {
    texto?: string;
  }): Promise<{ total: number; negocios: CandidatoNegocio[] }>;
}

export interface AgentContext {
  provider: LLMProvider;
  /** Requerido solo por Investigador cuando busca por id/nombre (no en modo manual). */
  mcpClient?: DirectorioConsulta;
  /** Requerido solo por Estratega. */
  servicios?: Servicio[];
}
