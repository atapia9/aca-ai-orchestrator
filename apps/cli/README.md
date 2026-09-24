# @acambaro/cli

Comando `orchestrate diagnostico`: produce el Diagnóstico Exprés SDDA completo para un negocio, en un solo comando.

```bash
pnpm orchestrate diagnostico --negocio "cafe-la-parroquia"      # busca en el directorio MCP (id exacto o texto libre)
pnpm orchestrate diagnostico --manual samples/negocio-ejemplo.json
pnpm orchestrate diagnostico --resume output/2026-09-24-cafe-la-parroquia

# flags adicionales, combinables:
#   --auto      omite la aprobación humana antes de la propuesta
#   --dry-run   usa ProveedorDemo (fixtures fijas, sin costo, sin API key) en vez de Anthropic real
```

Requiere `ANTHROPIC_MODEL` en `.env` siempre (nunca hardcodeado); `ANTHROPIC_API_KEY` solo si no se usa `--dry-run`.

## Salida

`output/<fecha>-<slug>/` con los 5 entregables en Markdown, `state.json` y `run-summary.json` (ver `@acambaro/orchestrator`). Al final se imprime el costo y los tokens por agente.

## `--dry-run`: `ProveedorDemo`

A diferencia de `MockProvider` (para tests unitarios, con una cola en orden fijo), `ProveedorDemo` elige su fixture según el contenido del `systemPrompt` de cada agente — Estratega y Contenido corren en paralelo en la corrida real, así que una cola FIFO no sería confiable aquí. Con `--negocio`, el nombre del negocio en los fixtures se rellena hasta que Investigador lo resuelve (antes de eso usa un genérico).

## Aprobación interactiva

Sin `--auto`, antes del paso 5 se imprime el diagnóstico y la recomendación y se pregunta `¿Aprobar recomendación? [s/n/editar]` por stdin (`src/aprobacion.ts`). `editar` pide un nuevo id de servicio (validado contra la escalera) y una justificación opcional.
