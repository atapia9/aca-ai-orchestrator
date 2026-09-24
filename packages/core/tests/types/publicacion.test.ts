import { describe, expect, it } from "vitest";
import {
  LIMITES_CARACTERES,
  publicacionSchema,
  publicacionesLlmSchema,
} from "../../src/types/publicacion.js";

describe("publicacionSchema", () => {
  it("acepta un texto dentro del límite", () => {
    expect(publicacionSchema.safeParse({ red: "facebook", texto: "hola" }).success).toBe(true);
  });

  it("rechaza un texto que excede el límite editorial de su red", () => {
    const texto = "a".repeat(LIMITES_CARACTERES.whatsapp_status + 1);
    expect(publicacionSchema.safeParse({ red: "whatsapp_status", texto }).success).toBe(false);
  });
});

describe("publicacionesLlmSchema", () => {
  const base = [
    { red: "facebook" as const, texto: "Post de Facebook" },
    { red: "instagram" as const, texto: "Post de Instagram" },
    { red: "whatsapp_status" as const, texto: "Status de WhatsApp" },
  ];

  it("acepta exactamente 3 publicaciones, una por red", () => {
    expect(publicacionesLlmSchema.safeParse(base).success).toBe(true);
  });

  it("rechaza si hay menos de 3", () => {
    expect(publicacionesLlmSchema.safeParse(base.slice(0, 2)).success).toBe(false);
  });

  it("rechaza si dos publicaciones son de la misma red", () => {
    const conRepetida = [base[0], base[0], base[2]];
    expect(publicacionesLlmSchema.safeParse(conRepetida).success).toBe(false);
  });
});
