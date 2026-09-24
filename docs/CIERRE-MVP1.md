# Informe de cierre — MVP1

Cierre de las Fases 0-5 de `acambaro-ai-orchestrator`: diagnóstico exprés de presencia digital, recomendación de servicio SDDA y contenido, de punta a punta, en un solo comando.

## Qué se entregó

- **Monorepo pnpm** (`apps/cli`, `packages/{core, mcp-directorio, mcp-client, agents, orchestrator, evals}`), TypeScript estricto con project references, ESLint + Prettier + Vitest.
- **CLI** (`pnpm orchestrate diagnostico --negocio "<id>"` / `--manual <archivo>`, flags `--auto`, `--dry-run`, `--resume`) que corre los 5 agentes — Investigador → Diagnóstico → (Estratega ∥ Contenido) → aprobación humana → Propuesta — y produce 5 Markdown + `state.json` + `run-summary.json`.
- **`packages/mcp-directorio`**: el servidor MCP existente (`mcp-directorio-acambaro`), migrado con su historial de git preservado (`git subtree`, ver [ADR 0002](ADR/0002-migracion-mcp-directorio.md)).
- **`LLMProvider` intercambiable**: `AnthropicProvider` (real, `ANTHROPIC_MODEL` configurable por env, nunca hardcodeado) / `MockProvider` (unit tests, sin red) / `ProveedorDemo` (`--dry-run` y evals en modo mock).
- **Validación de extremo a extremo con zod**: cada salida de cada agente se valida antes de escribirse a disco o pasar al siguiente paso.
- **Tope de gasto** (`MAX_USD_PER_RUN`, default $0.50 USD) verificado *antes* de cada llamada al modelo, no después — usando el peor caso posible como estimación.
- **Estado persistente y reanudable** (`--resume`): cada paso completado se guarda; una corrida interrumpida no repite pasos ya pagados.
- **`packages/evals`**: 3 negocios ficticios de giros y presencia digital distintos, 5 criterios verificables por corrida, `pnpm eval` (mock) / `pnpm eval --live` (API real).
- **Un ejemplo real de portafolio** en [`docs/demo/`](demo/) — salida sin editar de una corrida `--live` completa.
- **Documentación**: `README.md` (pitch, diagrama de arquitectura, instalación, uso, roadmap), [`docs/ARCHITECTURE.md`](ARCHITECTURE.md), 2 ADRs, `docs/ROADMAP.md`, `CLAUDE.md`, y un README por paquete.

## Métricas

| Métrica | Valor |
|---|---|
| Tests | 161/161 pasando, 34 archivos |
| Cobertura (global) | 98.59% statements · 81.85% branches · 91.39% funciones · 98.51% líneas |
| Cobertura (`core`/`agents`/`orchestrator`) | 100% statements y líneas en los tres; ≥70% pedido, superado con margen |
| Lint / typecheck / build | Limpios (`pnpm lint && pnpm typecheck && pnpm build`) |
| Commits | 42, desde el esqueleto del monorepo hasta el cierre de la Fase 5 |
| Costo real, corrida demo (`taller-mecanico-el-tornillo-feliz`, `--live`) | $0.0615 USD · 41.6 s · `claude-sonnet-5` |
| Costo real, las otras 2 corridas `--live` de evals | $0.0602 USD y $0.0518 USD |
| Tope configurado vs. costo real | $0.50 USD/corrida vs. ~$0.06 USD real — margen amplio |

Desglose por agente de la corrida demo (`run-summary.json`): Diagnóstico $0.0212 (1775 in / 1761 out tokens), Contenido $0.0153 (2762/982), Propuesta $0.0171 (3492/1011), Estratega $0.0079 (2503/292); Investigador no llama al modelo (solo consulta el MCP).

## Deuda técnica conocida

1. **`packages/mcp-directorio/data/inegi/` usa datos de muestra**, no datos reales del DENUE — el directorio no tiene negocios reales de Acámbaro todavía.
2. **CI sin verificar hasta este PR**: `.github/workflows/ci.yml` existe desde la Fase 2, pero solo dispara contra `main` — que no existió hasta abrir el PR de este cierre —, así que nunca se había ejecutado. Al abrirlo, corrió por primera vez y reveló un bug real de configuración (`pnpm/action-setup` con `version: 10` chocando con el `packageManager: "pnpm@10.33.0"` de `package.json`), ya corregido; falta todavía una regla de branch protection que lo exija antes de mergear.
3. **`ProveedorDemo`** (`packages/core/src/llm/proveedor-demo.ts`) elige su respuesta fija según un substring del prompt de sistema — funciona hoy porque yo controlo el texto de los 5 prompts, pero se rompe en silencio si alguno cambia de redacción sin actualizar el matching.
4. **`pareceEspanol`** (`packages/evals/src/criterios.ts`) es una heurística de stopwords, no detección de idioma real — puede dar falsos positivos/negativos en textos cortos o mixtos.
5. **Cobertura de branches más baja en las rutas de orquestación** (`grafo.ts` 72%, `reportes.ts` 62.5%) — las ramas sin cubrir son sobre todo las rutas de aprobación `"no"` / `"editar"` menos transitadas, no la lógica central del grafo.
6. **Sin agregación de costo/latencia entre corridas** — `run-summary.json` reporta por corrida individual; no hay una vista acumulada.
7. **Sin API HTTP ni panel web** — todo el flujo depende de tener acceso a una terminal (alcance explícito del MVP1).

## Próximos pasos priorizados para MVP2

1. **Datos reales del directorio (DENUE)** — conectar la API DENUE del INEGI en `packages/mcp-directorio/data/inegi/` para operar con negocios reales de Acámbaro, no solo con `--manual`.
2. **Branch protection en `main` que exija el check de CI** — el workflow ya corre y pasa (ver deuda técnica arriba); falta la regla que lo haga obligatorio antes de mergear.
3. **API HTTP + panel web** — una capa delgada sobre `ejecutarDiagnosticoExpres` para que alguien del equipo de SDDA sin acceso a terminal dispare diagnósticos y apruebe la recomendación.
4. **Publicación directa (WhatsApp Business / Meta / Google Business Profile)** — cerrar el ciclo "diagnóstico → contenido publicado" en vez de copiar/pegar a mano las 3 publicaciones que genera el agente de Contenido.
5. **Endurecer las heurísticas frágiles y agregar métricas entre corridas** — reemplazar el content-matching de `ProveedorDemo` y el detector de español de `pareceEspanol` por algo más robusto; acumular costo/latencia entre corridas antes de escalar el volumen de diagnósticos.

(Detalle y contexto adicional en [`docs/ROADMAP.md`](ROADMAP.md).)
