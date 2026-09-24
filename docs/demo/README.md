# Demo — corrida `--live`

Ejemplo real de portafolio: el Diagnóstico Exprés SDDA completo, generado con Claude Sonnet 5 (API real de Anthropic, sin mocks), para un negocio **ficticio**.

## [`taller-mecanico-el-tornillo-feliz/`](taller-mecanico-el-tornillo-feliz/)

Generado con:

```bash
pnpm eval --live
```

(uno de los 3 casos de `evals/casos/`; ver [`evals/README.md`](../../evals/README.md)).

- **Costo real:** $0.0615 USD (tope configurado: $0.50 USD por corrida).
- **Duración:** ~42 s.
- **Modelo:** `claude-sonnet-5`.
- Detalle de tokens por agente en [`run-summary.json`](taller-mecanico-el-tornillo-feliz/run-summary.json).

Los 5 entregables (`01-ficha.md` … `05-propuesta.md`) son la salida real y sin editar del modelo — solo pasaron la validación de zod de cada agente, ningún dato se ajustó a mano.
