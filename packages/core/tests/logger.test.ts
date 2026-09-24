import { describe, expect, it } from "vitest";
import { crearLogger } from "../src/logger.js";

describe("crearLogger", () => {
  it("crea un logger pino con el nombre dado", () => {
    const logger = crearLogger("test-logger");
    expect(logger.bindings().name).toBe("test-logger");
  });
});
