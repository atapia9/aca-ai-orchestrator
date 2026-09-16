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
- [x] `negocios.json` con 15–30 negocios ficticios en 6+ categorías
- [x] `domain/horario.ts` (abierto ahora, zona horaria MX) + pruebas
- [x] `domain/busqueda.ts` (texto, categoría, colonia, sin acentos) + pruebas
- [x] `domain/diagnostico.ts` (puntaje de presencia digital) + pruebas

## Fase 3 — Capacidades MCP (2 días)
- [x] Tools: `buscar_negocios`, `detalle_negocio`, `negocios_abiertos`, `diagnostico_digital`
- [x] Resources: `directorio://categorias`, `sdda://servicios`
- [x] Prompts: `recomendar_negocio`, `propuesta_sdda`
- [x] Probar cada capacidad en MCP Inspector
- [ ] Conectar en Claude Desktop y probar 5 preguntas reales — nota: en esta app híbrida (Claude Code + Desktop), `claude_desktop_config.json` es gestionado por la propia app y sobrescribe ediciones manuales de `mcpServers`; conéctalo desde Settings/Conectores dentro de la app en vez de editar el archivo a mano

## Fase 4 — Calidad y CI (1 día)
- [x] GitHub Actions: lint + test + build en cada push/PR
- [x] Cobertura ≥ 80 % en `domain/`
- [x] Manejo de errores claro (id inexistente, parámetros inválidos)
- [x] Tag `v0.1.0` y [release](https://github.com/atapia9/mcp-directorio-acambaro/releases/tag/v0.1.0)

## Fase 5 — Persistencia y despliegue (3 días)
- [x] Migrar repositorio a SQLite (misma interfaz)
- [x] `src/http.ts` con Streamable HTTP
- [ ] Desplegar en instancia OCI A1 (systemd o Docker) tras Cloudflare, HTTPS
- [x] Token simple por header para limitar acceso
- [ ] Tag `v0.2.0`

## Fase 6 — Integración y vitrina (2 días)
- [ ] (Opcional) Sincronizar con WordPress REST de staging.acambaro.com.mx
- [ ] README final: badges, GIF demo, diagrama, instalación en 5 min
- [ ] Publicar en LinkedIn + fijar repo en perfil GitHub
- [ ] (Opcional) Registrar en listados públicos de servidores MCP
- [ ] Tag `v1.0.0`

## Estimado total
≈ **12 días de trabajo** (2–3 semanas a ritmo parcial).
