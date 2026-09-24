import { z } from "zod";

export const REDES_SOCIALES = ["facebook", "instagram", "whatsapp_status"] as const;
export const redSocialSchema = z.enum(REDES_SOCIALES);
export type RedSocial = (typeof REDES_SOCIALES)[number];

/**
 * Límite editorial (no el técnico de cada plataforma): posts cortos rinden
 * mejor para un negocio local y son más fáciles de leer en WhatsApp Status.
 */
export const LIMITES_CARACTERES: Record<RedSocial, number> = {
  facebook: 500,
  instagram: 400,
  whatsapp_status: 200,
};

export const publicacionSchema = z
  .object({
    red: redSocialSchema,
    texto: z.string().min(1),
    hashtags: z.array(z.string()).optional(),
  })
  .refine(
    (pub) => pub.texto.length <= LIMITES_CARACTERES[pub.red],
    "El texto excede el límite de caracteres editorial para esta red.",
  );
export type Publicacion = z.infer<typeof publicacionSchema>;

/** Lo que debe producir el agente de Contenido: exactamente 3 posts, uno por red, sin repetir red. */
export const publicacionesLlmSchema = z
  .array(publicacionSchema)
  .length(REDES_SOCIALES.length)
  .refine(
    (pubs) => new Set(pubs.map((p) => p.red)).size === REDES_SOCIALES.length,
    `Debe haber exactamente una publicación por cada red: ${REDES_SOCIALES.join(", ")}.`,
  );
export type Publicaciones = z.infer<typeof publicacionesLlmSchema>;
