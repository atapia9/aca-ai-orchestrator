import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  NOMBRE_CONTENIDO,
  NOMBRE_DIAGNOSTICO,
  NOMBRE_ESTRATEGA,
  NOMBRE_INVESTIGADOR,
  NOMBRE_PROPUESTA,
  ejecutarContenido,
  ejecutarDiagnostico,
  ejecutarEstratega,
  ejecutarInvestigador,
  ejecutarPropuesta,
  type AgentContext,
  type DirectorioConsulta,
  type InvestigadorInput,
} from "@acambaro/agents";
import type {
  Diagnostico,
  LLMProvider,
  LLMUsage,
  Negocio,
  Publicaciones,
  Recomendacion,
  Servicio,
} from "@acambaro/core";
import { costoUsd, verificarPresupuesto } from "./costo.js";
import { cargarEstado, crearEstado, guardarEstado, type RunState } from "./estado.js";
import {
  renderContenido,
  renderDiagnostico,
  renderFicha,
  renderRecomendacion,
} from "./reportes.js";

const MAX_TOKENS_POR_LLAMADA = 4096;

export type DecisionAprobacion =
  { tipo: "si" } | { tipo: "no" } | { tipo: "editar"; recomendacion: Recomendacion };

export type FnAprobacion = (contexto: {
  diagnostico: Diagnostico;
  recomendacion: Recomendacion;
  publicaciones: Publicaciones;
  servicios: Servicio[];
}) => Promise<DecisionAprobacion>;

export interface EjecutarOpciones {
  outputDir: string;
  provider: LLMProvider;
  servicios: Servicio[];
  maxUsdPerRun: number;
  auto: boolean;
  dryRun: boolean;
  mcpClient?: DirectorioConsulta;
  negocioQuery?: string;
  manualNegocio?: Negocio;
  resume?: boolean;
  aprobar: FnAprobacion;
}

export interface ResumenAgente {
  inputTokens: number;
  outputTokens: number;
  costoUsd: number;
}

export interface RunSummary {
  outputDir: string;
  duracionMs: number;
  costoTotalUsd: number;
  porAgente: Record<string, ResumenAgente>;
}

export interface ResultadoCorrida {
  estado: RunState;
  completo: boolean;
  resumen: RunSummary;
}

export async function ejecutarDiagnosticoExpres(
  opciones: EjecutarOpciones,
): Promise<ResultadoCorrida> {
  const inicio = Date.now();
  const estado = opciones.resume
    ? cargarEstado(opciones.outputDir)
    : crearEstado({
        negocioQuery: opciones.negocioQuery,
        manualPath: opciones.manualNegocio ? "manual" : undefined,
        auto: opciones.auto,
        dryRun: opciones.dryRun,
      });
  if (!opciones.resume) guardarEstado(opciones.outputDir, estado);

  const ctx: AgentContext = {
    provider: opciones.provider,
    mcpClient: opciones.mcpClient,
    servicios: opciones.servicios,
  };
  const model = opciones.provider.model;
  const presupuesto = () =>
    verificarPresupuesto(
      costoAcumuladoUsd(estado, model),
      model,
      MAX_TOKENS_POR_LLAMADA,
      opciones.maxUsdPerRun,
    );

  // Paso 1: Investigador
  if (!estado.steps.investigador) {
    const input: InvestigadorInput = opciones.manualNegocio
      ? { tipo: "manual", negocio: opciones.manualNegocio }
      : { tipo: "id", query: opciones.negocioQuery! };
    const resultado = await ejecutarInvestigador(input, ctx);
    estado.steps.investigador = pasoCompletado(resultado.usage, resultado.data);
    guardarEstado(opciones.outputDir, estado);
    escribirArchivo(opciones.outputDir, "01-ficha.md", renderFicha(resultado.data));
  }
  const negocio = estado.steps.investigador.data;

  // Paso 2: Diagnóstico
  if (!estado.steps.diagnostico) {
    presupuesto();
    const resultado = await ejecutarDiagnostico(negocio, ctx);
    estado.steps.diagnostico = pasoCompletado(resultado.usage, resultado.data);
    guardarEstado(opciones.outputDir, estado);
    escribirArchivo(opciones.outputDir, "02-diagnostico.md", renderDiagnostico(resultado.data));
  }
  const diagnostico = estado.steps.diagnostico.data;

  // Pasos 3 (Estratega) y 4 (Contenido) en paralelo
  if (!estado.steps.estratega || !estado.steps.contenido) {
    const faltantes = Number(!estado.steps.estratega) + Number(!estado.steps.contenido);
    verificarPresupuesto(
      costoAcumuladoUsd(estado, model),
      model,
      MAX_TOKENS_POR_LLAMADA,
      opciones.maxUsdPerRun,
      faltantes,
    );

    const [estrategaResultado, contenidoResultado] = await Promise.all([
      estado.steps.estratega ? undefined : ejecutarEstratega(diagnostico, ctx),
      estado.steps.contenido ? undefined : ejecutarContenido({ negocio, diagnostico }, ctx),
    ]);

    if (estrategaResultado) {
      estado.steps.estratega = pasoCompletado(estrategaResultado.usage, estrategaResultado.data);
      escribirArchivo(
        opciones.outputDir,
        "03-recomendacion.md",
        renderRecomendacion(estrategaResultado.data),
      );
    }
    if (contenidoResultado) {
      estado.steps.contenido = pasoCompletado(contenidoResultado.usage, contenidoResultado.data);
      escribirArchivo(
        opciones.outputDir,
        "04-contenido.md",
        renderContenido(contenidoResultado.data),
      );
    }
    guardarEstado(opciones.outputDir, estado);
  }
  let recomendacion = estado.steps.estratega!.data;
  const publicaciones = estado.steps.contenido!.data;

  // Punto de aprobación humana (antes de generar la propuesta)
  if (!estado.steps.aprobado) {
    if (opciones.auto) {
      estado.steps.aprobado = true;
    } else {
      const decision = await opciones.aprobar({
        diagnostico,
        recomendacion,
        publicaciones,
        servicios: opciones.servicios,
      });
      if (decision.tipo === "no") {
        guardarEstado(opciones.outputDir, estado);
        return finalizar(opciones.outputDir, inicio, model, estado, false);
      }
      if (decision.tipo === "editar") {
        recomendacion = decision.recomendacion;
        estado.steps.estratega = { ...estado.steps.estratega!, data: recomendacion };
        escribirArchivo(
          opciones.outputDir,
          "03-recomendacion.md",
          renderRecomendacion(recomendacion),
        );
      }
      estado.steps.aprobado = true;
    }
    guardarEstado(opciones.outputDir, estado);
  }

  // Paso 5: Propuesta
  if (!estado.steps.propuesta) {
    presupuesto();
    const resultado = await ejecutarPropuesta(
      { negocio, diagnostico, recomendacion, publicaciones },
      ctx,
    );
    estado.steps.propuesta = pasoCompletado(resultado.usage, resultado.data);
    guardarEstado(opciones.outputDir, estado);
    escribirArchivo(opciones.outputDir, "05-propuesta.md", resultado.data.markdown);
  }

  return finalizar(opciones.outputDir, inicio, model, estado, true);
}

function pasoCompletado<T>(
  usage: LLMUsage,
  data: T,
): { completedAt: string; usage: LLMUsage; data: T } {
  return { completedAt: new Date().toISOString(), usage, data };
}

function pasosConUsage(estado: RunState): [string, LLMUsage][] {
  const entradas: [string, LLMUsage | undefined][] = [
    [NOMBRE_INVESTIGADOR, estado.steps.investigador?.usage],
    [NOMBRE_DIAGNOSTICO, estado.steps.diagnostico?.usage],
    [NOMBRE_ESTRATEGA, estado.steps.estratega?.usage],
    [NOMBRE_CONTENIDO, estado.steps.contenido?.usage],
    [NOMBRE_PROPUESTA, estado.steps.propuesta?.usage],
  ];
  return entradas.filter((e): e is [string, LLMUsage] => e[1] !== undefined);
}

function costoAcumuladoUsd(estado: RunState, model: string): number {
  return pasosConUsage(estado).reduce((total, [, usage]) => total + costoUsd(model, usage), 0);
}

function construirResumen(
  outputDir: string,
  duracionMs: number,
  model: string,
  estado: RunState,
): RunSummary {
  const porAgente: Record<string, ResumenAgente> = {};
  let costoTotalUsd = 0;
  for (const [nombre, usage] of pasosConUsage(estado)) {
    const costo = costoUsd(model, usage);
    costoTotalUsd += costo;
    porAgente[nombre] = {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costoUsd: costo,
    };
  }
  return { outputDir, duracionMs, costoTotalUsd, porAgente };
}

function finalizar(
  outputDir: string,
  inicio: number,
  model: string,
  estado: RunState,
  completo: boolean,
): ResultadoCorrida {
  const resumen = construirResumen(outputDir, Date.now() - inicio, model, estado);
  escribirArchivo(outputDir, "run-summary.json", JSON.stringify(resumen, null, 2));
  return { estado, completo, resumen };
}

function escribirArchivo(outputDir: string, nombre: string, contenido: string): void {
  const conSaltoFinal = contenido.endsWith("\n") ? contenido : `${contenido}\n`;
  writeFileSync(join(outputDir, nombre), conSaltoFinal, "utf-8");
}
