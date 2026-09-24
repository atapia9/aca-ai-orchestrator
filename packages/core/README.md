# @acambaro/core

Tipos de dominio, configuración, `LLMProvider` y logger/errores compartidos por `@acambaro/agents` y el orquestador.

## Tipos (`src/types/`)

`Negocio`, `Diagnostico` (6 dimensiones puntuadas por el agente de Diagnóstico — **no** confundir con la tool `diagnostico_digital` de `packages/mcp-directorio`, que es un cálculo por reglas fijas), `Recomendacion`, `Publicacion`/`Publicaciones` (con límites de caracteres editoriales por red), `Propuesta`.

## Config (`src/config/`)

- `cargarEscaleraServicios(ruta)`: lee y valida `config/sdda-servicios.yaml`.
- `cargarEnv(fuente?)`: valida `ANTHROPIC_MODEL` (requerido, nunca hardcodeado), `ANTHROPIC_API_KEY` (opcional) y `MAX_USD_PER_RUN` (default 0.5).

## LLM (`src/llm/`)

```ts
import { AnthropicProvider, MockProvider, generarConReintento } from "@acambaro/core";

const provider = new AnthropicProvider({
  model: env.ANTHROPIC_MODEL,
  apiKey: env.ANTHROPIC_API_KEY,
});
const { data, usage } = await generarConReintento(provider, { systemPrompt, userPrompt, schema });
```

- `LLMProvider.generateStructured()` hace **un** intento; usa `client.messages.parse()` + `zodOutputFormat()` del SDK de Anthropic (salida estructurada validada con el mismo schema de zod, sin tool-use forzado).
- `generarConReintento()` es la política de reintento única para todos los agentes: 1 reintento si la salida no valida (`LLMValidationError`), y `AgentError` (error controlado) si vuelve a fallar. Un `APIError` (red/auth/rate-limit) se propaga tal cual, sin reintentar.
- `MockProvider` nunca llama a la API real: se configura con una cola de respuestas fijas, cada una validada contra el schema pedido.

## Logger y errores

`crearLogger(nombre)` (pino, JSON estructurado). `LLMValidationError`, `AgentError`, `ConfigError`, `BudgetExceededError` en `src/errors.ts`.
