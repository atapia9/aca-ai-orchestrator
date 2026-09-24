# @acambaro/orchestrator

Corre los 5 agentes en orden (1 → 2 → (3 ∥ 4) → aprobación humana → 5), persiste el estado en `state.json` para poder reanudar, y aplica el tope de gasto (`MAX_USD_PER_RUN`) antes de cada llamada al modelo.

```ts
import { ejecutarDiagnosticoExpres } from "@acambaro/orchestrator";

const resultado = await ejecutarDiagnosticoExpres({
  outputDir,
  provider, // AnthropicProvider, MockProvider o ProveedorDemo (apps/cli)
  servicios, // cargarEscaleraServicios(...)
  maxUsdPerRun: env.MAX_USD_PER_RUN,
  auto: false, // false = pide aprobación antes del paso 5
  dryRun: false,
  mcpClient, // solo si negocioQuery viene de una búsqueda (no en modo manual)
  negocioQuery, // o manualNegocio
  resume: false,
  aprobar: async ({ diagnostico, recomendacion, publicaciones, servicios }) => ({ tipo: "si" }),
});
```

## Archivos generados en `outputDir`

`01-ficha.md`, `02-diagnostico.md`, `03-recomendacion.md`, `04-contenido.md`, `05-propuesta.md`, `state.json` (para `--resume`), `run-summary.json` (tokens/costo por agente + duración).

## Aprobación humana (`FnAprobacion`)

Antes del paso 5 se llama a `aprobar(...)` (salvo `auto: true`), que regresa una de:

- `{ tipo: "si" }` — continúa con la recomendación tal cual.
- `{ tipo: "no" }` — detiene la corrida sin generar la propuesta (`completo: false`); se puede continuar después con `resume: true`.
- `{ tipo: "editar", recomendacion }` — reemplaza la recomendación (por ejemplo, otro servicio de la escalera) antes de generar la propuesta.

## Reanudación

Si `resume: true`, se carga `state.json` de `outputDir` y cada paso ya completado se reusa tal cual (no se vuelve a llamar al modelo); solo se ejecutan los pasos faltantes. El presupuesto acumulado (`MAX_USD_PER_RUN`) también se calcula sobre el estado completo, no solo la corrida actual.

## Costo (`src/costo.ts`)

Tabla de precios de referencia (USD/millón de tokens) para modelos Anthropic conocidos, con un default razonable para modelos no listados. `verificarPresupuesto` lanza `BudgetExceededError` (@acambaro/core) si la siguiente llamada (o par de llamadas paralelas) rebasaría el tope, usando el peor caso (`maxTokens` completo) como estimación conservadora.
