/** El modelo produjo una salida que no valida contra el schema esperado (reintentable). */
export class LLMValidationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "LLMValidationError";
  }
}

/** Un agente agotó sus reintentos o encontró un error de negocio irrecuperable. */
export class AgentError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AgentError";
  }
}

/** Config inválida o inaccesible: YAML de servicios, variables de entorno, etc. */
export class ConfigError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ConfigError";
  }
}

/** La corrida excedería MAX_USD_PER_RUN antes de la siguiente llamada al modelo. */
export class BudgetExceededError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "BudgetExceededError";
  }
}
