import { AgentError, MockProvider } from "@acambaro/core";
import { describe, expect, it } from "vitest";
import type { AgentContext } from "../src/contexto.js";
import { ejecutarContenido } from "../src/contenido.js";
import { diagnosticoFixture, negocioFixture } from "./fixtures.js";

const publicacionesValidas = [
  { red: "facebook" as const, texto: "Ven a Café La Parroquia en el Centro de Acámbaro." },
  {
    red: "instagram" as const,
    texto: "Pan dulce recién horneado todos los días. #Acambaro",
    hashtags: ["Acambaro"],
  },
  { red: "whatsapp_status" as const, texto: "Abrimos hoy 8am-2pm. Te esperamos." },
];

describe("ejecutarContenido", () => {
  it("regresa las 3 publicaciones generadas por el modelo", async () => {
    const provider = new MockProvider([publicacionesValidas]);
    const ctx: AgentContext = { provider };

    const resultado = await ejecutarContenido(
      { negocio: negocioFixture, diagnostico: diagnosticoFixture },
      ctx,
    );

    expect(resultado.data).toHaveLength(3);
    expect(resultado.data.map((p) => p.red).sort()).toEqual([
      "facebook",
      "instagram",
      "whatsapp_status",
    ]);
  });

  it("error controlado si el modelo repite red en vez de cubrir las 3", async () => {
    const invalida = [publicacionesValidas[0], publicacionesValidas[0], publicacionesValidas[2]];
    const provider = new MockProvider([invalida, invalida]);
    const ctx: AgentContext = { provider };

    await expect(
      ejecutarContenido({ negocio: negocioFixture, diagnostico: diagnosticoFixture }, ctx),
    ).rejects.toThrow(AgentError);
  });
});
