# 0001 — Monorepo con pnpm workspaces

## Estado

Aceptado (2026-09-24).

## Contexto

El proyecto integra piezas con ciclos de vida distintos pero fuertemente acopladas en tiempo de ejecución: un servidor MCP existente (`mcp-directorio-acambaro`, repo propio con su propio historial de git), un cliente MCP, tipos/config compartidos, 5 agentes LLM y un orquestador con CLI. Todas se prueban y se despliegan juntas para el MVP1 (un solo comando `orchestrate diagnostico`), y comparten TypeScript, Node, linting y las mismas convenciones de datos.

## Decisión

Un monorepo (nombre de producto "Acámbaro AI Orchestrator"; repo de GitHub `atapia9/aca-ai-orchestrator`) con **pnpm workspaces**, TypeScript estricto con project references, y un único ESLint/Prettier/Vitest a nivel raíz. El servidor MCP existente se incorpora como `packages/mcp-directorio` conservando su historial de git vía `git subtree add` (Fase 2).

## Alternativas consideradas

- **Polyrepo** (mantener `mcp-directorio-acambaro` separado y un repo nuevo para el orquestador, consumiendo el MCP publicado como paquete o vía URL de git): más simple de aislar, pero obliga a publicar/versionar el MCP para consumirlo, complica probar en un mismo PR un cambio conjunto (agente nuevo + tool nuevo del MCP), y no encaja con el objetivo de portafolio de mostrar el sistema completo en un solo lugar.
- **npm o yarn workspaces en vez de pnpm:** el ecosistema TypeScript reciente de este proyecto (y el repo que se integra) ya usa pnpm; además pnpm maneja mejor dependencias nativas compartidas (`better-sqlite3`, usada por `mcp-directorio`) vía hoisting estricto y control explícito de scripts de build (`onlyBuiltDependencies`).
- **Turborepo o Nx:** aportarían cache de tareas y orquestación de builds más sofisticada, pero son una dependencia y una capa de configuración adicional que el MVP1 (6 paquetes, sin CI multi-repo) no necesita todavía. Project references de TypeScript + scripts de pnpm bastan por ahora; se puede reconsiderar si el monorepo crece.

## Consecuencias

- Un solo `pnpm install` resuelve todo el árbol de dependencias; un commit puede tocar agente + MCP + docs de forma atómica.
- El CI existente de `mcp-directorio-acambaro` (`.github/workflows/ci.yml`) queda inerte una vez viva en `packages/mcp-directorio/.github/workflows/`, porque GitHub Actions solo lee `.github/workflows/` de la raíz del repo. Se reemplaza por un workflow único en la raíz del monorepo (Fase 2).
- Si en el futuro el MCP necesita publicarse o desplegarse de forma independiente (despliegue en OCI + Cloudflare, fuera del alcance del MVP1), sigue siendo un paquete con su propio `package.json`, `Dockerfile` y `deploy/`, así que extraerlo a su propio repo más adelante (`git subtree split`) seguiría siendo posible sin perder su historial.
