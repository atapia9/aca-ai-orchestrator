import { parseArgs } from "node:util";

export interface CliOptions {
  negocio?: string;
  manual?: string;
  auto: boolean;
  dryRun: boolean;
  resume?: string;
}

export function parsearArgumentos(argv: string[]): CliOptions {
  const [subcomando, ...resto] = argv;
  if (subcomando !== "diagnostico") {
    throw new Error(
      `Comando desconocido: "${subcomando ?? ""}".\nUso: orchestrate diagnostico --negocio "<id-o-nombre>" | --manual <ruta.json> | --resume <carpeta> [--auto] [--dry-run]`,
    );
  }

  const { values } = parseArgs({
    args: resto,
    options: {
      negocio: { type: "string" },
      manual: { type: "string" },
      auto: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      resume: { type: "string" },
    },
  });

  const opciones: CliOptions = {
    negocio: values.negocio,
    manual: values.manual,
    auto: values.auto ?? false,
    dryRun: values["dry-run"] ?? false,
    resume: values.resume,
  };

  const modos = [opciones.negocio, opciones.manual, opciones.resume].filter((v) => v !== undefined);
  if (modos.length !== 1) {
    throw new Error("Debes pasar exactamente una de: --negocio, --manual o --resume.");
  }

  return opciones;
}
