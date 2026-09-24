import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DIMENSIONES_DIAGNOSTICO,
  MockProvider,
  type Negocio,
  type Recomendacion,
  type Servicio,
} from "@acambaro/core";
import { BudgetExceededError } from "@acambaro/core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ejecutarDiagnosticoExpres, type EjecutarOpciones } from "../src/grafo.js";

const negocio: Negocio = {
  id: "taller-mecanico-ejemplo",
  nombre: "Taller Mecánico El Tornillo Feliz",
  categoria: "taller_mecanico",
  descripcion: "Taller de mecánica automotriz general.",
  direccion: "Calle Ejemplo 123",
  colonia: "Centro",
  whatsapp: "+52 417 555 0199",
  horario: { lun: ["09:00-18:00"] },
  etiquetas: ["mecanico"],
  actualizado: "2026-09-24",
  ficticio: true,
};

const servicios: Servicio[] = [
  {
    id: "taller-operacion-digital",
    nombre: "Taller Operación Digital Productiva",
    precio_mxn: 9999,
    estado: "confirmado",
  },
  {
    id: "mapa-oportunidades",
    nombre: "Mapa de Oportunidades",
    precio_mxn: 4900,
    estado: "hipotesis",
  },
];

const diagnosticoFixture = {
  puntuaciones: DIMENSIONES_DIAGNOSTICO.map((dimension) => ({
    dimension,
    puntaje: 50,
    justificacion: "x",
  })),
  datosVerificados: ["Tiene WhatsApp registrado."],
  supuestos: ["Sin Google Business Profile confirmado."],
  quickWins: ["a", "b", "c"],
};
const estrategaFixture = {
  servicioId: "taller-operacion-digital",
  justificacion: "Necesita estructurar su operación.",
};
const contenidoFixture = [
  { red: "facebook" as const, texto: "Post de Facebook" },
  { red: "instagram" as const, texto: "Post de Instagram" },
  { red: "whatsapp_status" as const, texto: "Status" },
];
const propuestaFixture = { markdown: "# Propuesta\nPrecio confirmado: $9,999 MXN." };
const propuestaFixtureHipotesis = { markdown: "# Propuesta\nPrecio en hipótesis: $4,900 MXN." };

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "orchestrator-grafo-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function opcionesBase(overrides: Partial<EjecutarOpciones> = {}): EjecutarOpciones {
  return {
    outputDir: dir,
    provider: new MockProvider([]),
    servicios,
    maxUsdPerRun: 0.5,
    auto: true,
    dryRun: true,
    manualNegocio: negocio,
    aprobar: async () => ({ tipo: "si" }),
    ...overrides,
  };
}

describe("ejecutarDiagnosticoExpres - camino feliz", () => {
  it("corre los 5 pasos, escribe los 7 archivos y regresa completo:true", async () => {
    const provider = new MockProvider([
      diagnosticoFixture,
      estrategaFixture,
      contenidoFixture,
      propuestaFixture,
    ]);

    const resultado = await ejecutarDiagnosticoExpres(opcionesBase({ provider }));

    expect(resultado.completo).toBe(true);
    for (const archivo of [
      "01-ficha.md",
      "02-diagnostico.md",
      "03-recomendacion.md",
      "04-contenido.md",
      "05-propuesta.md",
      "state.json",
      "run-summary.json",
    ]) {
      expect(existsSync(join(dir, archivo)), `falta ${archivo}`).toBe(true);
    }
    expect(readFileSync(join(dir, "05-propuesta.md"), "utf-8").trim()).toBe(
      propuestaFixture.markdown,
    );
    expect(resultado.resumen.porAgente).toHaveProperty("diagnostico");
    expect(resultado.resumen.porAgente).toHaveProperty("propuesta");
  });
});

describe("ejecutarDiagnosticoExpres - aprobación humana", () => {
  it('decisión "no": se detiene antes de la propuesta y no la genera', async () => {
    const provider = new MockProvider([diagnosticoFixture, estrategaFixture, contenidoFixture]);

    const resultado = await ejecutarDiagnosticoExpres(
      opcionesBase({ provider, auto: false, aprobar: async () => ({ tipo: "no" }) }),
    );

    expect(resultado.completo).toBe(false);
    expect(existsSync(join(dir, "05-propuesta.md"))).toBe(false);
    expect(resultado.estado.steps.aprobado).toBeUndefined();
  });

  it('decisión "editar": reemplaza la recomendación antes de generar la propuesta', async () => {
    const provider = new MockProvider([
      diagnosticoFixture,
      estrategaFixture,
      contenidoFixture,
      propuestaFixtureHipotesis,
    ]);
    const recomendacionEditada: Recomendacion = {
      negocioId: negocio.id,
      servicio: servicios.find((s) => s.id === "mapa-oportunidades")!,
      justificacion: "El consultor prefiere empezar con el mapa de oportunidades.",
    };

    const resultado = await ejecutarDiagnosticoExpres(
      opcionesBase({
        provider,
        auto: false,
        aprobar: async () => ({ tipo: "editar", recomendacion: recomendacionEditada }),
      }),
    );

    expect(resultado.completo).toBe(true);
    expect(resultado.estado.steps.estratega?.data.servicio.id).toBe("mapa-oportunidades");
    expect(readFileSync(join(dir, "03-recomendacion.md"), "utf-8")).toContain(
      "Mapa de Oportunidades",
    );
  });

  it("--auto omite la aprobación sin llamar a aprobar()", async () => {
    const provider = new MockProvider([
      diagnosticoFixture,
      estrategaFixture,
      contenidoFixture,
      propuestaFixture,
    ]);
    let aprobarLlamado = false;

    await ejecutarDiagnosticoExpres(
      opcionesBase({
        provider,
        auto: true,
        aprobar: async () => ((aprobarLlamado = true), { tipo: "si" }),
      }),
    );

    expect(aprobarLlamado).toBe(false);
  });
});

describe("ejecutarDiagnosticoExpres - reanudación", () => {
  it("--resume continúa desde el último paso exitoso sin repetir llamadas ya hechas", async () => {
    const provider1 = new MockProvider([diagnosticoFixture, estrategaFixture, contenidoFixture]);
    const parcial = await ejecutarDiagnosticoExpres(
      opcionesBase({ provider: provider1, auto: false, aprobar: async () => ({ tipo: "no" }) }),
    );
    expect(parcial.completo).toBe(false);

    // Nuevo proveedor con una sola respuesta en cola: si el resume repitiera
    // pasos ya hechos, se quedaría sin fixtures y fallaría.
    const provider2 = new MockProvider([propuestaFixture]);
    const final = await ejecutarDiagnosticoExpres(
      opcionesBase({ provider: provider2, resume: true, auto: true, manualNegocio: undefined }),
    );

    expect(final.completo).toBe(true);
    expect(readFileSync(join(dir, "05-propuesta.md"), "utf-8").trim()).toBe(
      propuestaFixture.markdown,
    );
    // Los pasos reanudados conservan los datos de la primera corrida.
    expect(final.estado.steps.investigador?.data.id).toBe(negocio.id);
  });
});

describe("ejecutarDiagnosticoExpres - presupuesto", () => {
  it("se detiene antes de la siguiente llamada si excedería MAX_USD_PER_RUN", async () => {
    const provider = new MockProvider([diagnosticoFixture]);

    await expect(
      ejecutarDiagnosticoExpres(opcionesBase({ provider, maxUsdPerRun: 0 })),
    ).rejects.toThrow(BudgetExceededError);
  });
});
