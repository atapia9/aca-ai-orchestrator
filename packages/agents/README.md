# @acambaro/agents

Los 5 agentes del Diagnóstico Exprés SDDA, cada uno con su prompt de sistema versionado en `prompts/*.md`.

| Agente                 | Entrada                                          | Salida                           | Llama al modelo                                                                                            |
| ---------------------- | ------------------------------------------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `ejecutarInvestigador` | id/nombre de búsqueda (vía MCP) o negocio manual | `Negocio`                        | Solo si hay 2+ candidatos ambiguos en la búsqueda; id exacto, manual o un solo candidato resuelven sin LLM |
| `ejecutarDiagnostico`  | `Negocio`                                        | `Diagnostico`                    | Siempre                                                                                                    |
| `ejecutarEstratega`    | `Diagnostico` + `ctx.servicios`                  | `Recomendacion`                  | Siempre                                                                                                    |
| `ejecutarContenido`    | `Negocio` + `Diagnostico`                        | `Publicaciones` (3, una por red) | Siempre                                                                                                    |
| `ejecutarPropuesta`    | todo lo anterior                                 | `Propuesta` (Markdown)           | Siempre                                                                                                    |

Cada `ejecutarX` regresa `{ data, usage }` (`GenerateStructuredResult` de `@acambaro/core`) para que el orquestador acumule tokens/costo por agente.

## Contexto compartido (`AgentContext`)

```ts
interface AgentContext {
  provider: LLMProvider; // AnthropicProvider o MockProvider
  mcpClient?: DirectorioConsulta; // requerido solo por Investigador (no en modo manual)
  servicios?: Servicio[]; // requerido solo por Estratega
}
```

`DirectorioConsulta` es la interfaz mínima que un agente necesita del directorio (`detalleNegocio`, `buscarNegocios`); `DirectorioClient` de `@acambaro/mcp-client` la satisface estructuralmente, así que las pruebas pueden usar un objeto plano sin levantar el servidor MCP real.

## Cómo añadir un agente

Ver `CLAUDE.md` en la raíz del monorepo.
