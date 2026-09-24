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

1. **Datos reales del directorio (DENUE)** — `packages/mcp-directorio/data/inegi/` hoy trae datos de muestra; conectar la API DENUE del INEGI es lo que convierte el diagnóstico en algo usable con negocios reales de Acámbaro, no solo con `--manual`.
2. **CI en GitHub Actions** — hoy `lint`/`typecheck`/`test`/`build` solo se corren localmente antes de cada commit; sin un workflow que los corra en cada push/PR, una regresión puede llegar a `main` sin que nadie la note.
3. **API HTTP + panel web** — la CLI es suficiente para operar el MVP1 a mano, pero para que alguien del equipo de SDDA (no solo quien tiene la terminal) dispare diagnósticos y revise/aprueba la recomendación, hace falta una capa HTTP delgada sobre `ejecutarDiagnosticoExpres`.
4. **Publicación directa (WhatsApp/Meta/Google Business)** — hoy el agente de Contenido redacta las 3 publicaciones pero alguien las copia y pega a mano; conectar las APIs de Meta/Google Business cerraría el ciclo de "diagnóstico → contenido publicado".
5. **Endurecer heurísticas frágiles** — `ProveedorDemo` (`packages/core/src/llm/proveedor-demo.ts`) elige su respuesta por substring del prompt de sistema, y `pareceEspanol` (`packages/evals/src/criterios.ts`) es una lista de stopwords; ambas funcionan hoy pero se rompen en silencio si cambia el texto de un prompt. Vale la pena, además, acumular costo/latencia entre corridas (hoy `run-summary.json` solo reporta por corrida individual) para tener una vista agregada antes de escalar el volumen de diagnósticos.
