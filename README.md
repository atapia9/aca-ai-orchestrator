# Acámbaro AI Orchestrator

> Un comando, cinco agentes: convierte los datos de un negocio local de Acámbaro, Gto., en un diagnóstico de presencia digital, una recomendación de servicio SDDA y contenido listo para revisión humana.
> Cada salida se valida con zod antes de tocar disco, y un tope de gasto (`MAX_USD_PER_RUN`) se verifica antes de cada llamada al modelo — nunca después.
> Construido por [Armando Tapia](https://github.com/atapia9) para **SDDA — Servicios Digitales de Acámbaro**, la marca de consultoría de Acambaro.com.mx.

**🔗 [Demo en vivo](https://atapia9.github.io/aca-ai-orchestrator/docs/index.html#top)** — pipeline de los 5 agentes, métricas reales y la corrida `--live` completa. Código en [`docs/index.html`](docs/index.html).

**Estado:** MVP1 completo (Fases 0-5, ver el [informe de cierre](docs/CIERRE-MVP1.md)). MVP2 en curso: el directorio ya puede poblarse con negocios reales de Acámbaro vía la API DENUE del INEGI (`pnpm importar-denue`, ver [`packages/mcp-directorio/data/inegi/README.md`](packages/mcp-directorio/data/inegi/README.md)). Detalle y siguientes pasos en [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Problema y solución

**Problema.** SDDA necesita producir, para cada negocio local de Acámbaro, un diagnóstico de presencia digital, una recomendación de servicio, contenido para redes y una propuesta comercial.

**Solución.** Un orquestador que encadena cinco agentes de IA sobre esos pasos, deja una aprobación humana antes de la propuesta y valida cada salida con zod. Un tope de gasto por corrida se verifica antes de cada llamada al modelo.

## Arquitectura

```mermaid
flowchart TD
    CLI["apps/cli (comando orchestrate)"] --> ORQ

    subgraph ORQ["packages/orchestrator"]
        direction LR
        A1["1. Investigador"] --> A2["2. Diagnóstico"]
        A2 --> A3["3. Estratega"]
        A2 --> A4["4. Contenido"]
        A3 --> AP{"Aprobación humana"}
        A4 --> AP
        AP --> A5["5. Propuesta"]
    end

    A1 & A2 & A3 & A4 & A5 -.->|"LLMProvider"| LLM{{"AnthropicProvider / MockProvider"}}
    A1 -->|"consulta negocio"| MCPC["packages/mcp-client"]
    MCPC -->|"stdio"| MCPD["packages/mcp-directorio"]
    A3 -.->|"lee"| YAML[("config/sdda-servicios.yaml")]
    ORQ -.->|"persiste"| STATE[("output/&lt;fecha&gt;-&lt;slug&gt;/state.json")]
```

Detalle completo (paquetes, dependencias, decisiones clave) en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Stack

TypeScript estricto (ESM, project references) · Node.js ^22.12 / ^24 / ≥26 · pnpm 10 (monorepo) · Claude API (`@anthropic-ai/sdk`) · Model Context Protocol (SDK oficial; cliente y servidor) · zod · pino · Vitest · ESLint y Prettier · GitHub Actions

## Instalación

```bash
git clone https://github.com/atapia9/aca-ai-orchestrator.git
cd aca-ai-orchestrator
pnpm install
pnpm build
cp .env.example .env   # ANTHROPIC_MODEL y MAX_USD_PER_RUN ya traen un valor por defecto
```

Requiere Node `^22.12.0 || ^24.0.0 || >=26.0.0` y pnpm ≥10.

## Uso

Sin API key ni costo — `--dry-run` usa respuestas fijas (`ProveedorDemo`):

```bash
pnpm orchestrate diagnostico --manual samples/negocio-ejemplo.json --dry-run --auto
```

Con la API real de Anthropic (usa `ANTHROPIC_API_KEY` de `.env`; pide aprobación antes del paso 5):

```bash
pnpm orchestrate diagnostico --negocio "<id-o-nombre-del-directorio>"
# o, con datos capturados a mano en vez del directorio MCP:
pnpm orchestrate diagnostico --manual ./samples/negocio-ejemplo.json
```

Flags principales: `--auto` (omite la aprobación humana), `--resume <carpeta>` (continúa una corrida interrumpida sin repetir pasos ya completados ni su costo).

### Qué produce

Cada corrida escribe en `output/<fecha>-<slug>/`:

1. `01-ficha.md` — ficha normalizada del negocio.
2. `02-diagnostico.md` — puntaje 0-100 por dimensión, con hallazgos y quick wins; distingue dato verificado de supuesto.
3. `03-recomendacion.md` — servicio recomendado de la escalera SDDA, con justificación.
4. `04-contenido.md` — 3 publicaciones de redes sociales listas para revisión.
5. `05-propuesta.md` — propuesta comercial en Markdown.
6. `run-summary.json` — tokens y costo real por agente, duración total.

Un ejemplo real (corrida `--live` contra la API de Anthropic, negocio ficticio) está en [`docs/demo/taller-mecanico-el-tornillo-feliz/`](docs/demo/taller-mecanico-el-tornillo-feliz/) — costó $0.0615 USD y tardó ~42 s.

## Estructura del monorepo

```
apps/cli/                 Punto de entrada: comando `orchestrate`
packages/core/            Tipos de dominio, esquemas zod, config, LLMProvider
packages/mcp-directorio/  Servidor MCP del directorio de negocios (migrado, historial conservado; ahora con importador de datos reales vía DENUE)
packages/mcp-client/      Cliente tipado hacia el MCP del directorio
packages/agents/          Los 5 agentes especializados
packages/orchestrator/    Grafo de ejecución, estado, aprobación humana
packages/evals/           Corredor de evaluación (`pnpm eval`)
config/                   Escalera de servicios SDDA (YAML editable)
samples/                  Negocios ficticios de ejemplo
evals/                    Casos de evaluación (negocios ficticios + criterios verificables)
docs/                     Arquitectura, ADRs, roadmap, demo
```

## Desarrollo

```bash
pnpm install
pnpm build
pnpm lint && pnpm typecheck && pnpm test
pnpm eval          # evals en modo mock
pnpm eval --live   # evals contra la API real - gasta dinero de verdad
```

Ver [`CLAUDE.md`](CLAUDE.md) para las convenciones del repo.

## Estado y límites

- **Los datos de ejemplo son ficticios.** Los datos reales del DENUE (INEGI) se importan a un archivo que no se versiona (`.gitignore`). Falta completar a mano, con el consentimiento de cada negocio, los campos que DENUE no trae antes de publicarlos en el directorio.
- **Sin release publicado** y sin protección de ramas sobre el check de CI (pendiente; ver el roadmap).
- **Origen del servidor MCP.** `packages/mcp-directorio` proviene de [mcp-directorio-acambaro](https://github.com/atapia9/mcp-directorio-acambaro) y se integró con su historial de git ([ADR 0002](docs/ADR/0002-migracion-mcp-directorio.md)). El desarrollo activo continúa aquí: este paquete ya incluye el importador del DENUE.

## Roadmap

MVP1 (Fases 0-5) está completo. De MVP2:

- ✅ **Datos reales del directorio (DENUE)** — `pnpm importar-denue` ya está verificado contra la API real del INEGI (miles de candidatos reales para Acámbaro). Falta completar a mano, por negocio y con su consentimiento, los campos que DENUE no trae antes de pasar alguno al directorio en vivo.
- 🔜 Branch protection sobre el check de CI, API HTTP/panel web, publicación directa a WhatsApp/Meta/Google Business, y endurecer un par de heurísticas conocidas.

Detalle completo en [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Licencia

MIT — ver [`LICENSE`](LICENSE).

---

> Este material fue elaborado con asistencia de Claude (Anthropic) y revisado por Jesús Armando Tapia Gallegos.
