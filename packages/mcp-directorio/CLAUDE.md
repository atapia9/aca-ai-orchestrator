# CLAUDE.md — Instrucciones para Claude Code

> **En una línea:** contexto y reglas para que Claude Code construya este MCP de forma consistente.

## Proyecto

Servidor MCP en TypeScript: directorio de negocios de Acámbaro, Gto., con diagnóstico digital vinculado a SDDA (Servicios Digitales de Acámbaro). Portafolio público de Armando Tapia (GitHub `atapia9`).

Documentos de referencia: `docs/00-VISION-Y-ALCANCE.md`, `docs/01-ARQUITECTURA.md`, `docs/02-ROADMAP.md`.

## Comandos

```bash
npm install
npm run dev        # tsx watch src/index.ts
npm run build      # tsc -> dist/
npm test           # vitest
npm run lint
npm run inspect    # npx @modelcontextprotocol/inspector node dist/index.js
```

## Reglas

1. Trabaja **por fases** del roadmap; marca las casillas completadas en `docs/02-ROADMAP.md`.
2. Lógica en `src/domain/` sin dependencias del SDK; siempre con pruebas.
3. Valida toda entrada de tools con `zod`.
4. **Nunca** escribas en `stdout` en modo stdio; usa `console.error`.
5. Zona horaria: `America/Mexico_City`.
6. Nombres de tools, campos y mensajes al usuario en **español**; código y commits en inglés (Conventional Commits).
7. Datos semilla ficticios; no inventes negocios reales con datos de contacto reales.
8. Antes de cerrar una tarea: `npm run lint && npm test && npm run build` deben pasar.
9. Cambios pequeños y explicados; pregunta antes de agregar dependencias nuevas.

## Estilo

- TypeScript `strict`, ESM, funciones puras cuando sea posible.
- Comentarios didácticos breves (el repo también sirve como material de clase).
