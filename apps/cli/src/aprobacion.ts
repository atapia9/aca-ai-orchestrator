import { createInterface } from "node:readline/promises";
import { buscarServicio } from "@acambaro/core";
import type { FnAprobacion } from "@acambaro/orchestrator";

export const aprobarInteractivo: FnAprobacion = async ({
  diagnostico,
  recomendacion,
  servicios,
}) => {
  console.log(`\nDiagnóstico: ${diagnostico.puntajeGeneral}/100`);
  console.log(
    `Servicio recomendado: ${recomendacion.servicio.nombre} (${recomendacion.servicio.estado})`,
  );
  console.log(`Justificación: ${recomendacion.justificacion}`);

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const respuesta = (await rl.question("\n¿Aprobar recomendación? [s/n/editar] "))
      .trim()
      .toLowerCase();

    if (respuesta === "n" || respuesta === "no") {
      return { tipo: "no" };
    }

    if (respuesta === "editar" || respuesta === "e") {
      console.log("\nServicios disponibles:");
      for (const servicio of servicios) {
        console.log(`  ${servicio.id} - ${servicio.nombre} (${servicio.estado})`);
      }
      const nuevoId = (await rl.question("Nuevo id de servicio: ")).trim();
      const nuevoServicio = buscarServicio(servicios, nuevoId);
      if (!nuevoServicio) {
        console.log(`"${nuevoId}" no es un id válido; se mantiene la recomendación original.`);
        return { tipo: "si" };
      }
      const justificacion = (
        await rl.question("Justificación (opcional, Enter para mantener la original): ")
      ).trim();
      return {
        tipo: "editar",
        recomendacion: {
          ...recomendacion,
          servicio: nuevoServicio,
          justificacion: justificacion || recomendacion.justificacion,
        },
      };
    }

    return { tipo: "si" };
  } finally {
    rl.close();
  }
};
