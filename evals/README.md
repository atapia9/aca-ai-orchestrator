# evals

`casos/`: 3 negocios ficticios (`"ficticio": true`) de giros distintos, con perfiles de presencia digital deliberadamente diferentes:

| Caso | Giro | Presencia digital |
|---|---|---|
| `panaderia.json` | Panadería | Mínima: sin redes ni sitio web, solo teléfono. |
| `taller-mecanico.json` | Taller mecánico | Media: WhatsApp + Facebook, sin sitio web. |
| `consultorio-dental.json` | Consultorio dental | Alta: sitio web + Facebook + Instagram + Google Maps. |

## `pnpm eval`

Corre los 3 casos con `@acambaro/evals` (`packages/evals`) y reporta aprobado/reprobado por caso:

```bash
pnpm eval          # modo mock (ProveedorDemo, sin costo, sin API key)
pnpm eval --live   # API real de Anthropic - gasta dinero de verdad
```

Criterios verificados por caso (`packages/evals/src/criterios.ts`):

1. La corrida completa los 5 pasos sin error de validación.
2. La recomendación existe en `config/sdda-servicios.yaml`.
3. Las 3 publicaciones están en español (heurística de stopwords — no es detección de idioma real).
4. Las publicaciones respetan el límite de caracteres editorial de su red.
5. La propuesta marca visiblemente un precio en hipótesis, si el servicio recomendado no está confirmado.

La mayoría ya están garantizados por construcción (cada agente valida su salida con zod antes de regresarla); se re-verifican aquí para el reporte y porque zod no puede expresar "está en español".

Un ejemplo de corrida `--live` guardado como referencia de portafolio está en [`docs/demo/`](../docs/demo/).
