# Roadmap y checklist

> **En una línea:** los pasos, en orden, para pasar de repo vacío a MCP desplegado y presentable en el portafolio.

## Fase 0 — Preparación (1 día)
- [x] Crear repo público `atapia9/mcp-directorio-acambaro` (MIT, `.gitignore` Node)
- [x] Instalar Node 20+, Claude Desktop y Claude Code
- [x] Copiar estos `.md` a `docs/` y `CLAUDE.md` a la raíz
- [ ] Leer la documentación oficial: modelcontextprotocol.io (quickstart servidor TS)

## Fase 1 — Esqueleto (1 día)
- [x] `npm init`, TypeScript, ESLint, Prettier, vitest
- [x] `src/index.ts` con `McpServer` + `StdioServerTransport`
- [x] Tool de prueba `ping` y verificación en MCP Inspector
- [x] Commit: `feat: esqueleto del servidor MCP`

## Fase 2 — Dominio y datos (2 días)
- [ ] `negocios.json` con 15–30 negocios ficticios en 6+ categorías
- [ ] `domain/horario.ts` (abierto ahora, zona horaria MX) + pruebas
- [ ] `domain/busqueda.ts` (texto, categoría, colonia, sin acentos) + pruebas
- [ ] `domain/diagnostico.ts` (puntaje de presencia digital) + pruebas

## Fase 3 — Capacidades MCP (2 días)
- [ ] Tools: `buscar_negocios`, `detalle_negocio`, `negocios_abiertos`, `diagnostico_digital`
- [ ] Resources: `directorio://categorias`, `sdda://servicios`
- [ ] Prompts: `recomendar_negocio`, `propuesta_sdda`
- [ ] Probar cada capacidad en MCP Inspector
- [ ] Conectar en Claude Desktop (`claude_desktop_config.json`) y probar 5 preguntas reales

## Fase 4 — Calidad y CI (1 día)
- [ ] GitHub Actions: lint + test + build en cada push/PR
- [ ] Cobertura ≥ 80 % en `domain/`
- [ ] Manejo de errores claro (id inexistente, parámetros inválidos)
- [ ] Tag `v0.1.0` y release

## Fase 5 — Persistencia y despliegue (3 días)
- [ ] Migrar repositorio a SQLite (misma interfaz)
- [ ] `src/http.ts` con Streamable HTTP
- [ ] Desplegar en instancia OCI A1 (systemd o Docker) tras Cloudflare, HTTPS
- [ ] Token simple por header para limitar acceso
- [ ] Tag `v0.2.0`

## Fase 6 — Integración y vitrina (2 días)
- [ ] (Opcional) Sincronizar con WordPress REST de staging.acambaro.com.mx
- [ ] README final: badges, GIF demo, diagrama, instalación en 5 min
- [ ] Publicar en LinkedIn + fijar repo en perfil GitHub
- [ ] (Opcional) Registrar en listados públicos de servidores MCP
- [ ] Tag `v1.0.0`

## Estimado total
≈ **12 días de trabajo** (2–3 semanas a ritmo parcial).
