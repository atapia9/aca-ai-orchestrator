import { MockProvider } from "@acambaro/core";
import { describe, expect, it } from "vitest";
import { AgentError } from "@acambaro/core";
import type { AgentContext, DirectorioConsulta } from "../src/contexto.js";
import { ejecutarInvestigador } from "../src/investigador.js";
import { negocioFixture } from "./fixtures.js";

function fakeMcpClient(overrides: Partial<DirectorioConsulta> = {}): DirectorioConsulta {
  return {
    detalleNegocio:
      overrides.detalleNegocio ?? (async () => Promise.reject(new Error("no existe"))),
    buscarNegocios: overrides.buscarNegocios ?? (async () => ({ total: 0, negocios: [] })),
  };
}

describe("ejecutarInvestigador", () => {
  it("modo manual: valida y regresa el negocio sin llamar al modelo", async () => {
    const ctx: AgentContext = { provider: new MockProvider([]) };
    const resultado = await ejecutarInvestigador({ tipo: "manual", negocio: negocioFixture }, ctx);
    expect(resultado.data.id).toBe(negocioFixture.id);
    expect(resultado.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
  });

  it("id exacto: no llama al modelo si detalleNegocio ya resuelve", async () => {
    const mcpClient = fakeMcpClient({ detalleNegocio: async () => negocioFixture });
    const ctx: AgentContext = { provider: new MockProvider([]), mcpClient };
    const resultado = await ejecutarInvestigador({ tipo: "id", query: "cafe-la-parroquia" }, ctx);
    expect(resultado.data.id).toBe(negocioFixture.id);
    expect(resultado.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
  });

  it("sin mcpClient en el contexto: lanza AgentError", async () => {
    const ctx: AgentContext = { provider: new MockProvider([]) };
    await expect(ejecutarInvestigador({ tipo: "id", query: "algo" }, ctx)).rejects.toThrow(
      AgentError,
    );
  });

  it("búsqueda sin candidatos: lanza AgentError", async () => {
    const mcpClient = fakeMcpClient();
    const ctx: AgentContext = { provider: new MockProvider([]), mcpClient };
    await expect(ejecutarInvestigador({ tipo: "id", query: "no existe" }, ctx)).rejects.toThrow(
      AgentError,
    );
  });

  it("un solo candidato: resuelve directo sin llamar al modelo", async () => {
    const mcpClient = fakeMcpClient({
      buscarNegocios: async () => ({
        total: 1,
        negocios: [
          {
            id: negocioFixture.id,
            nombre: negocioFixture.nombre,
            categoria: "cafeteria",
            colonia: "Centro",
          },
        ],
      }),
      detalleNegocio: async (id) =>
        id === negocioFixture.id ? negocioFixture : Promise.reject(new Error("x")),
    });
    const ctx: AgentContext = { provider: new MockProvider([]), mcpClient };
    const resultado = await ejecutarInvestigador({ tipo: "id", query: "parroquia" }, ctx);
    expect(resultado.data.id).toBe(negocioFixture.id);
    expect(resultado.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
  });

  it("varios candidatos: el modelo desambigua y se resuelve el detalle elegido", async () => {
    const candidatos = [
      {
        id: "cafe-la-parroquia",
        nombre: "Café La Parroquia",
        categoria: "cafeteria",
        colonia: "Centro",
      },
      {
        id: "aroma-de-acambaro",
        nombre: "Cafetería Aroma de Acámbaro",
        categoria: "cafeteria",
        colonia: "San Nicolás",
      },
    ];
    const mcpClient = fakeMcpClient({
      buscarNegocios: async () => ({ total: 2, negocios: candidatos }),
      detalleNegocio: async (id) =>
        id === negocioFixture.id ? negocioFixture : Promise.reject(new Error("x")),
    });
    const provider = new MockProvider([
      { idSeleccionado: "cafe-la-parroquia", justificacion: "Coincide el nombre." },
    ]);
    const ctx: AgentContext = { provider, mcpClient };

    const resultado = await ejecutarInvestigador({ tipo: "id", query: "la parroquia" }, ctx);

    expect(resultado.data.id).toBe(negocioFixture.id);
    expect(resultado.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
  });

  it("varios candidatos, el modelo no encuentra coincidencia clara: lanza AgentError", async () => {
    const candidatos = [
      { id: "a", nombre: "Negocio A", categoria: "x", colonia: "Centro" },
      { id: "b", nombre: "Negocio B", categoria: "x", colonia: "Centro" },
    ];
    const mcpClient = fakeMcpClient({
      buscarNegocios: async () => ({ total: 2, negocios: candidatos }),
    });
    const provider = new MockProvider([
      { idSeleccionado: null, justificacion: "Ninguno coincide." },
    ]);
    const ctx: AgentContext = { provider, mcpClient };

    await expect(ejecutarInvestigador({ tipo: "id", query: "algo ambiguo" }, ctx)).rejects.toThrow(
      AgentError,
    );
  });
});
