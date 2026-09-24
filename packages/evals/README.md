# @acambaro/evals

Corredor de evaluación: ejecuta `ejecutarDiagnosticoExpres` (`@acambaro/orchestrator`) contra los 3 casos ficticios de [`evals/casos/`](../../evals/casos/) y verifica criterios objetivos sobre el resultado (`src/criterios.ts`).

```bash
pnpm eval          # modo mock (ProveedorDemo, sin costo, sin API key)
pnpm eval --live   # API real de Anthropic - gasta dinero de verdad
```

En modo mock usa `ProveedorDemo` (`@acambaro/core`, contenido fijo por tipo de agente); en `--live` usa `AnthropicProvider` con `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL` de `.env`, cada corrida escribe sus 6 archivos de salida en un directorio temporal (`mkdtempSync`) y respeta `MAX_USD_PER_RUN`.

Ver [`evals/README.md`](../../evals/README.md) para el detalle de los 3 casos y los 5 criterios verificados.
