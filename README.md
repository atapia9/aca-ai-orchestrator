# Acámbaro AI Orchestrator

> Orquestador multiagente que convierte los datos de un negocio local de Acámbaro, Gto., en un **diagnóstico de presencia digital**, una **recomendación de servicio SDDA** y contenido listo para revisión humana — en un solo comando.

Construido por [Armando Tapia](https://github.com/atapia9) para **SDDA — Servicios Digitales de Acámbaro**, la marca de consultoría de Acambaro.com.mx. Aplica a Acámbaro el mismo patrón multiagente del _IBEX AI Business Orchestrator_.

**Estado:** en construcción (Fase 2 de 6 del MVP1). Ver [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Qué va a hacer (MVP1)

```bash
pnpm orchestrate diagnostico --negocio "<id-o-nombre>"
# o
pnpm orchestrate diagnostico --manual ./samples/negocio-ejemplo.json
```

Dado un negocio (del directorio MCP o capturado a mano), produce en Markdown:

1. Ficha normalizada del negocio.
2. Diagnóstico de presencia digital (0-100 por dimensión, con hallazgos y quick wins).
3. Recomendación de servicio de la escalera SDDA.
4. 3 publicaciones de redes sociales.
5. Una propuesta comercial — con un punto de aprobación humana antes de generarla.

## Estructura del monorepo

```
apps/cli/                 Punto de entrada: comando `orchestrate`
packages/core/            Tipos de dominio, esquemas zod, config, LLMProvider
packages/mcp-directorio/  Servidor MCP del directorio de negocios (migrado, historial conservado)
packages/mcp-client/      Cliente tipado hacia el MCP del directorio
packages/agents/          Los 5 agentes especializados
packages/orchestrator/    Grafo de ejecución, estado, aprobación humana
config/                   Escalera de servicios SDDA (YAML editable)
samples/                  Negocios ficticios de ejemplo
evals/                    Casos de evaluación de los agentes
docs/                     Arquitectura, ADRs, roadmap
```

Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para el detalle.

## Desarrollo

```bash
pnpm install
pnpm build
pnpm lint && pnpm typecheck && pnpm test
```

Requiere Node `^22.12.0 || ^24.0.0 || >=26.0.0` y pnpm ≥10. Ver [`CLAUDE.md`](CLAUDE.md) para las convenciones del repo.

## Licencia

MIT — ver [`LICENSE`](LICENSE).
