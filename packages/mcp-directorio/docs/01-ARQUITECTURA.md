# Arquitectura técnica

> **En una línea:** qué expone el servidor (tools, resources, prompts), cómo se organiza el código y con qué stack.

## 1. Stack

- **Lenguaje:** TypeScript (Node.js 22.12+ LTS — requerido por `better-sqlite3` y `vitest` desde la Fase 5)
- **SDK:** `@modelcontextprotocol/sdk` (oficial) + `zod` para validar entradas
- **Datos:** JSON (MVP) → SQLite con `better-sqlite3` (v0.2)
- **Pruebas:** `vitest`
- **Calidad:** ESLint + Prettier
- **CI:** GitHub Actions (lint, test, build)
- **Depuración:** `@modelcontextprotocol/inspector`

## 2. Diagrama

```
Claude Desktop / Claude Code / otro cliente MCP
            │  (stdio  |  Streamable HTTP)
            ▼
┌──────────────────────────────────────┐
│  src/server.ts  (McpServer)          │
│   ├─ tools/      acciones            │
│   ├─ resources/  datos de lectura    │
│   └─ prompts/    plantillas          │
│            │                         │
│  src/domain/  lógica pura (testeable)│
│            │                         │
│  src/data/    repositorio            │
│   JSON ─► SQLite ─► WordPress REST   │
└──────────────────────────────────────┘
```

## 3. Capacidades MCP

### Tools

| Nombre                | Entrada                                              | Salida                                                      |
| --------------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| `buscar_negocios`     | `texto?`, `categoria?`, `colonia?`, `abierto_ahora?` | Lista resumida                                              |
| `detalle_negocio`     | `id`                                                 | Ficha completa (horario, contacto, redes, sitio)            |
| `negocios_abiertos`   | `dia`, `hora`                                        | Negocios abiertos en ese momento                            |
| `diagnostico_digital` | `id`                                                 | Puntaje 0–100 de presencia digital + servicio SDDA sugerido |

### Resources

| URI                       | Contenido                                                 |
| ------------------------- | --------------------------------------------------------- |
| `directorio://categorias` | Catálogo de categorías                                    |
| `sdda://servicios`        | Escalera de servicios SDDA (diagnóstico → acompañamiento) |

### Prompts

| Nombre               | Uso                                                        |
| -------------------- | ---------------------------------------------------------- |
| `recomendar_negocio` | Guía al modelo para recomendar según necesidad del usuario |
| `propuesta_sdda`     | Genera borrador de propuesta comercial para un negocio     |

## 4. Modelo de datos (Negocio)

```ts
{
  id: string;              // slug: "cafe-la-parroquia"
  nombre: string;
  categoria: string;       // "cafeteria", "ferreteria", ...
  descripcion: string;
  direccion: string;
  colonia: string;
  telefono?: string;
  whatsapp?: string;
  sitio_web?: string;
  redes?: { facebook?: string; instagram?: string; google_maps?: string };
  horario: Record<"lun"|"mar"|"mie"|"jue"|"vie"|"sab"|"dom", string[]>; // ["09:00-14:00"]
  etiquetas: string[];
  actualizado: string;     // ISO date
}
```

## 5. Estructura del repositorio

```
mcp-directorio-acambaro/
├─ src/
│  ├─ index.ts            # arranque stdio
│  ├─ http.ts             # arranque Streamable HTTP (v0.2)
│  ├─ server.ts           # registra tools/resources/prompts
│  ├─ tools/  resources/  prompts/
│  ├─ domain/             # horario.ts, diagnostico.ts, busqueda.ts
│  └─ data/               # repo.ts, negocios.json
├─ tests/
├─ docs/                  # estos .md
├─ .github/workflows/ci.yml
├─ CLAUDE.md
├─ README.md
└─ LICENSE (MIT)
```

## 6. Decisiones de diseño

- Lógica de dominio **separada** del SDK → se prueba sin levantar el servidor.
- Zona horaria fija `America/Mexico_City` para "abierto ahora".
- Respuestas de tools en texto legible + `structuredContent` JSON.
- Logs a `stderr` (nunca `stdout`, rompe el protocolo stdio).
- Datos semilla ficticios; los reales solo con consentimiento del negocio.
