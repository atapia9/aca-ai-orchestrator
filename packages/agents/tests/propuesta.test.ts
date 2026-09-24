import { AgentError, MockProvider, type Recomendacion } from "@acambaro/core";
import { describe, expect, it } from "vitest";
import type { AgentContext } from "../src/contexto.js";
import { ejecutarPropuesta } from "../src/propuesta.js";
import { diagnosticoFixture, negocioFixture, serviciosFixture } from "./fixtures.js";

const publicaciones = [
  { red: "facebook" as const, texto: "Post de Facebook" },
  { red: "instagram" as const, texto: "Post de Instagram" },
  { red: "whatsapp_status" as const, texto: "Status de WhatsApp" },
];

function recomendacionCon(servicioId: string): Recomendacion {
  const servicio = serviciosFixture.find((s) => s.id === servicioId)!;
  return { negocioId: negocioFixture.id, servicio, justificacion: "Justificación de prueba." };
}

describe("ejecutarPropuesta", () => {
  it("acepta cualquier markdown si el servicio ya está confirmado", async () => {
    const provider = new MockProvider([{ markdown: "# Propuesta\nPrecio: $9,999 MXN." }]);
    const ctx: AgentContext = { provider };

    const resultado = await ejecutarPropuesta(
      {
        negocio: negocioFixture,
        diagnostico: diagnosticoFixture,
        recomendacion: recomendacionCon("taller-operacion-digital"),
        publicaciones,
      },
      ctx,
    );

    expect(resultado.data.servicioId).toBe("taller-operacion-digital");
    expect(resultado.data.markdown).toContain("Propuesta");
  });

  it("error controlado si el servicio es hipótesis y el markdown no lo marca, ni tras reintentar", async () => {
    const sinMarcar = { markdown: "# Propuesta\nPrecio: $4,900 MXN." };
    const provider = new MockProvider([sinMarcar, sinMarcar]);
    const ctx: AgentContext = { provider };

    await expect(
      ejecutarPropuesta(
        {
          negocio: negocioFixture,
          diagnostico: diagnosticoFixture,
          recomendacion: recomendacionCon("mapa-oportunidades"),
          publicaciones,
        },
        ctx,
      ),
    ).rejects.toThrow(AgentError);
  });

  it("se recupera en el reintento si la segunda versión sí marca la hipótesis", async () => {
    const sinMarcar = { markdown: "# Propuesta\nPrecio: $4,900 MXN." };
    const conMarca = {
      markdown: "# Propuesta\nPrecio: $4,900 MXN (hipótesis, sujeto a validación).",
    };
    const provider = new MockProvider([sinMarcar, conMarca]);
    const ctx: AgentContext = { provider };

    const resultado = await ejecutarPropuesta(
      {
        negocio: negocioFixture,
        diagnostico: diagnosticoFixture,
        recomendacion: recomendacionCon("mapa-oportunidades"),
        publicaciones,
      },
      ctx,
    );

    expect(resultado.data.markdown).toContain("hipótesis");
  });
});
