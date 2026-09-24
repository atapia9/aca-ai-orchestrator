import { AgentError, MockProvider } from "@acambaro/core";
import { describe, expect, it } from "vitest";
import type { AgentContext } from "../src/contexto.js";
import { ejecutarEstratega } from "../src/estratega.js";
import { diagnosticoFixture, serviciosFixture } from "./fixtures.js";

describe("ejecutarEstratega", () => {
  it("resuelve el servicio completo cuando el modelo elige un id válido", async () => {
    const provider = new MockProvider([
      {
        servicioId: "taller-operacion-digital",
        justificacion: "Necesita estructurar su operación.",
      },
    ]);
    const ctx: AgentContext = { provider, servicios: serviciosFixture };

    const resultado = await ejecutarEstratega(diagnosticoFixture, ctx);

    expect(resultado.data.servicio).toEqual(
      serviciosFixture.find((s) => s.id === "taller-operacion-digital"),
    );
    expect(resultado.data.negocioId).toBe(diagnosticoFixture.negocioId);
  });

  it("reintenta y luego falla controladamente si el modelo inventa un servicioId", async () => {
    const inventado = { servicioId: "servicio-que-no-existe", justificacion: "x" };
    const provider = new MockProvider([inventado, inventado]);
    const ctx: AgentContext = { provider, servicios: serviciosFixture };

    await expect(ejecutarEstratega(diagnosticoFixture, ctx)).rejects.toThrow(AgentError);
  });

  it("lanza AgentError si no hay servicios en el contexto", async () => {
    const ctx: AgentContext = { provider: new MockProvider([]) };
    await expect(ejecutarEstratega(diagnosticoFixture, ctx)).rejects.toThrow(AgentError);
  });
});
