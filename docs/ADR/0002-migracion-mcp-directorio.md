# 0002 — Migración de mcp-directorio-acambaro con git subtree

## Estado

Aceptado (2026-09-24).

## Contexto

`mcp-directorio-acambaro` vivía en su propio repo (27 commits, un solo autor, 2026-09-16/17, sin secretos en el historial — verificado en la Fase 0) y debía integrarse a `packages/mcp-directorio` sin perder su historial de git. Se evaluaron `git subtree add` y `git filter-repo` + merge (ver el informe de la Fase 0).

## Decisión

Se usó `git subtree add --prefix=packages/mcp-directorio <remote> main` (sin `--squash`), agregando el remoto `mcp-directorio-src` para poder traer actualizaciones futuras con `git subtree pull` si el repo original se sigue desarrollando por separado.

## Consecuencia importante (no obvia): `git log -- packages/mcp-directorio` no basta

`git subtree add` crea un commit de merge cuyo segundo padre es el historial **original, sin el prefijo de ruta** (esos 27 commits tienen `README.md`, `src/index.ts`, etc. — no `packages/mcp-directorio/README.md`). Como ningún commit anterior al merge tiene contenido en la ruta `packages/mcp-directorio/`, la simplificación de historial de git no los conecta automáticamente con esa ruta.

Por eso:

- `git log --oneline -- packages/mcp-directorio` solo muestra **un** commit: el merge (`chore: integra mcp-directorio-acambaro via git subtree`).
- El historial completo **sí está ahí, intacto y verificable** — solo hay que pedirlo distinto:

  ```bash
  # Ver los 27 commits originales (mensajes, autor, fechas, diffs - todo intacto):
  git log --oneline 6f21157^2

  # Ver todo en un unico grafo (incluye ambas lineas de historia):
  git log --oneline --graph --all
  ```

- `git filter-repo` sí habría producido commits reescritos con el prefijo ya incluido en cada uno, haciendo que `git log -- packages/mcp-directorio` "a secas" mostrara las 27 entradas — al costo de recalcular el hash de cada commit (ya no serían, bit a bit, los mismos objetos que en `github.com/atapia9/mcp-directorio-acambaro`).

## Alternativas consideradas

Ver ADR 0001 y el informe de la Fase 0 para la comparación completa `subtree` vs. `filter-repo`. Se mantuvo `subtree` porque preserva los commits originales **exactamente** (mismos hashes, verificables contra el repo fuente) — se prefirió esa fidelidad sobre la conveniencia de un `git log` de una sola línea.

## Consecuencias

- La procedencia del código es 100% auditable commit por commit, pero hace falta conocer este detalle para "ver" la historia completa con un comando directo.
- Se documenta aquí para que una futura sesión (o Armando en 6 meses) no piense que la historia se perdió.
- El remoto `mcp-directorio-src` se agregó en este checkout para hacer el import. Los remotes no viajan con `git push` — quien quiera un futuro `git subtree pull` deberá agregarlo de nuevo:
  ```bash
  git remote add mcp-directorio-src https://github.com/atapia9/mcp-directorio-acambaro
  git fetch mcp-directorio-src main
  git subtree pull --prefix=packages/mcp-directorio mcp-directorio-src main
  ```
