# CLAUDE.md — Acámbaro AI Orchestrator

## Propósito

Monorepo que produce, con un solo comando, el "Diagnóstico Exprés SDDA": diagnóstico de presencia digital + recomendación de servicio + 3 publicaciones + propuesta comercial para un negocio local de Acámbaro, Gto. Ver `docs/ARCHITECTURE.md` y `docs/ROADMAP.md`.

Negocio: Acambaro.com.mx (agencia de marketing) / SDDA — Servicios Digitales de Acámbaro (consultoría de Administración y Mercadotecnia + implementación técnica).

## Comandos

```bash
pnpm install
pnpm build              # tsc --build (project references)
pnpm typecheck          # tsc --build --force
pnpm lint               # eslint .
pnpm format             # prettier --write .
pnpm test               # vitest run (workspace: cada paquete trae su propio vitest.config.ts)
pnpm test:coverage
pnpm orchestrate diagnostico --negocio "<id-o-nombre>"
pnpm orchestrate diagnostico --manual ./samples/negocio-ejemplo.json --dry-run --auto
pnpm orchestrate diagnostico --resume output/<fecha>-<slug>
pnpm eval                # Fase 5+
```

## Convenciones

- **Idioma:** código, identificadores y nombres de paquete/carpeta en inglés; prompts, salidas al usuario, nombres de tools MCP, README y docs en español.
- **TypeScript estricto, ESM, project references.** Cada paquete extiende `tsconfig.base.json` y se agrega a `references` del `tsconfig.json` raíz al crearse.
- **Validación:** toda entrada/salida de agente y de tool MCP se valida con `zod`. Si la salida de un agente falla la validación: un reintento pasando el error de zod al modelo, y luego error controlado (nunca reintentos infinitos, nunca aceptar salida inválida).
- **`LLMProvider` intercambiable:** interfaz única con `AnthropicProvider` (real, `@anthropic-ai/sdk`) y `MockProvider` (fixtures fijas). **Los tests nunca llaman a la API real** — siempre `MockProvider`.
- **Modelo por variable de entorno:** `ANTHROPIC_MODEL` en `.env`. Nunca hardcodear un id de modelo en el código.
- **Límite de gasto:** `MAX_USD_PER_RUN` (default 0.50 USD). El orquestador estima el costo antes de cada llamada y se detiene si la excedería.
- **Logging:** `pino`, estructurado. Al final de cada corrida: resumen de tokens de entrada/salida por agente, costo estimado en USD y duración.
- **Secretos:** solo en `.env` (gitignored). `.env.example` sin valores reales.
- **MCP:** transporte stdio únicamente en este MVP; el orquestador levanta `packages/mcp-directorio` como proceso hijo vía `packages/mcp-client`.
- **Commits:** Conventional Commits, pequeños y atómicos. Antes de cerrar una tarea: `pnpm lint && pnpm typecheck && pnpm test` deben pasar. Preguntar antes de agregar una dependencia nueva.
- **Convenciones heredadas de `packages/mcp-directorio`** (desde la Fase 2): nunca escribir en `stdout` en modo stdio (usar `console.error`); zona horaria `America/Mexico_City`; nombres de tools/campos en español.

## Reglas de datos

- **No inventar negocios reales.** Los ejemplos de `samples/` son ficticios y lo declaran explícitamente (`"ficticio": true`).
- Si el directorio MCP ya tiene datos (reales o ficticios), usarlos tal cual — no completarlos con suposiciones.
- El agente de Diagnóstico distingue explícitamente entre **dato verificado** (viene del directorio o de la captura manual) y **supuesto** (inferido por el modelo), y los lista por separado en el reporte.
- Sin web scraping ni enriquecimiento automático de datos en este MVP.

## Cómo añadir un agente

1. Crear el prompt de sistema versionado en `packages/agents/prompts/<nombre>.md`.
2. Definir el esquema zod de entrada y de salida (junto al agente, en `packages/agents/src/<nombre>.ts`).
3. Implementar la clase/función con `run(input, ctx): Promise<Salida>`, validando la respuesta del `LLMProvider` con el esquema zod de salida (reintento con el error de validación, luego error controlado).
4. Registrar el agente en el grafo de ejecución de `packages/orchestrator`.
5. Escribir un test unitario con `MockProvider` y una fixture de respuesta fija — sin llamadas reales a la API.
6. Si el agente necesita datos del directorio, consumirlos vía `packages/mcp-client`, nunca importando `mcp-directorio` directamente.

## Estado actual

MVP1 en construcción, fase por fase (ver `docs/ROADMAP.md`). No adelantar trabajo de una fase posterior ni saltarse los puntos de aprobación sin que Armando lo pida explícitamente.
