# MCP Directorio Acámbaro

> Servidor **Model Context Protocol** en TypeScript que permite a asistentes de IA buscar negocios locales de Acámbaro, Guanajuato, y generar un diagnóstico de presencia digital vinculado a los servicios de SDDA.

## Resumen
**Qué es:** un MCP que conecta el directorio de Acambaro.com.mx con Claude.
**Pasos:** esqueleto → datos y lógica → tools/resources/prompts → pruebas y CI → despliegue en OCI → vitrina de portafolio.

## Documentación
| Archivo | De qué trata |
|---|---|
| [`docs/00-VISION-Y-ALCANCE.md`](docs/00-VISION-Y-ALCANCE.md) | Por qué, para quién, alcance y criterios de éxito |
| [`docs/01-ARQUITECTURA.md`](docs/01-ARQUITECTURA.md) | Stack, capacidades MCP, modelo de datos, estructura |
| [`docs/02-ROADMAP.md`](docs/02-ROADMAP.md) | Fases y checklist de construcción |
| [`CLAUDE.md`](CLAUDE.md) | Instrucciones para Claude Code |

## Capacidades (v0.1)
- **Tools:** `buscar_negocios`, `detalle_negocio`, `negocios_abiertos`, `diagnostico_digital`
- **Resources:** `directorio://categorias`, `sdda://servicios`
- **Prompts:** `recomendar_negocio`, `propuesta_sdda`

## Uso rápido (cuando esté construido)
```bash
git clone https://github.com/atapia9/mcp-directorio-acambaro
cd mcp-directorio-acambaro && npm install && npm run build
```
En `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "directorio-acambaro": {
      "command": "node",
      "args": ["/ruta/a/mcp-directorio-acambaro/dist/index.js"]
    }
  }
}
```

## Autor
**Armando Tapia** — Acambaro.com.mx · SDDA · [GitHub @atapia9](https://github.com/atapia9)

## Licencia
MIT
