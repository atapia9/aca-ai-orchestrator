# @acambaro/mcp-client

Cliente tipado hacia `packages/mcp-directorio` (levanta el servidor como proceso hijo vía stdio).

```ts
import { DirectorioClient } from "@acambaro/mcp-client";

const cliente = await DirectorioClient.connect();
const { negocios } = await cliente.buscarNegocios({ categoria: "cafeteria" });
const ficha = await cliente.detalleNegocio("cafe-la-parroquia");
const diagnostico = await cliente.diagnosticoDigital("cafe-la-parroquia");
await cliente.close();
```

Requiere que `packages/mcp-directorio` ya esté compilado (`pnpm build` en la raíz, o `pnpm --filter mcp-directorio-acambaro build`) — `DirectorioClient.connect()` lanza un error claro si no encuentra el `dist/index.js`.

## API

| Método                        | Tool/resource MCP subyacente       |
| ----------------------------- | ---------------------------------- |
| `buscarNegocios(filtros)`     | `buscar_negocios`                  |
| `detalleNegocio(id)`          | `detalle_negocio`                  |
| `negociosAbiertos(dia, hora)` | `negocios_abiertos`                |
| `diagnosticoDigital(id)`      | `diagnostico_digital`              |
| `categorias()`                | resource `directorio://categorias` |

Todas las respuestas se validan con zod (`src/schemas.ts`) antes de regresar al llamador.
