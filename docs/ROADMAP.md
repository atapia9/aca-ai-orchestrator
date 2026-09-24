# Roadmap

## MVP1 (completo)

1. ~~Fase 0 — Reconocimiento del MCP existente~~
2. ~~Fase 1 — Esqueleto del monorepo~~
3. ~~Fase 2 — Integración del MCP Directorio~~
4. ~~Fase 3 — Core y agentes~~
5. ~~Fase 4 — Orquestador y CLI~~
6. ~~Fase 5 — Evals y demo~~

## Fuera de alcance del MVP1 (backlog para MVP2+)

- API HTTP y panel web.
- Despliegue en Oracle Cloud (OCI Always Free, instancia A1 en Monterrey) y publicación en WordPress (`staging.acambaro.com.mx`).
- Integraciones con WhatsApp Business, Meta y Google Business Profile.
- Agentes para PrepA286 (Acuerdo 286) y para el Colegio de Administradores.
- Scraping o enriquecimiento automático de datos — incluye completar `data/inegi/` con datos reales vía la API DENUE (ver `packages/mcp-directorio/data/inegi/README.md` una vez migrado en la Fase 2).
- Memoria de largo plazo o base vectorial.

## Próximos pasos priorizados para MVP2

1. **Datos reales del directorio (DENUE)** _(en curso)_ — `packages/mcp-directorio/data/inegi/` hoy trae datos de muestra; conectar la API DENUE del INEGI es lo que convierte el diagnóstico en algo usable con negocios reales de Acámbaro, no solo con `--manual`. Ya existe `pnpm importar-denue` (`packages/mcp-directorio/scripts/importar-denue.ts`) y la normalización a candidatos (`src/domain/denue.ts`); una prueba con token inválido confirmó que este entorno sí llega a `inegi.org.mx` (403 real de la API, no bloqueo de red). Falta un solo bloqueador: el token gratuito de INEGI, que solo Armando puede tramitar. Detalle en `packages/mcp-directorio/data/inegi/README.md`.
2. **Branch protection en `main` que exija el check de CI** — el workflow (`.github/workflows/ci.yml`, `lint`/`typecheck`/`test:coverage`/`build`) existe desde la Fase 2, pero solo dispara contra `main`; como `main` no existió hasta el PR de cierre del MVP1, nunca se había ejecutado, y ese primer PR reveló y corrigió un bug de configuración real (conflicto de versión de pnpm entre el workflow y `packageManager` de `package.json`). Falta la regla de branch protection que lo exija como status check obligatorio antes de mergear.
3. **API HTTP + panel web** — la CLI es suficiente para operar el MVP1 a mano, pero para que alguien del equipo de SDDA (no solo quien tiene la terminal) dispare diagnósticos y revise/aprueba la recomendación, hace falta una capa HTTP delgada sobre `ejecutarDiagnosticoExpres`.
4. **Publicación directa (WhatsApp/Meta/Google Business)** — hoy el agente de Contenido redacta las 3 publicaciones pero alguien las copia y pega a mano; conectar las APIs de Meta/Google Business cerraría el ciclo de "diagnóstico → contenido publicado".
5. **Endurecer heurísticas frágiles** — `ProveedorDemo` (`packages/core/src/llm/proveedor-demo.ts`) elige su respuesta por substring del prompt de sistema, y `pareceEspanol` (`packages/evals/src/criterios.ts`) es una lista de stopwords; ambas funcionan hoy pero se rompen en silencio si cambia el texto de un prompt. Vale la pena, además, acumular costo/latencia entre corridas (hoy `run-summary.json` solo reporta por corrida individual) para tener una vista agregada antes de escalar el volumen de diagnósticos.
