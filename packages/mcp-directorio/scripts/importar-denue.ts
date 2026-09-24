#!/usr/bin/env node
/**
 * Consulta la API del DENUE (INEGI) por cada clase SCIAN ya mapeada en
 * data/inegi/scian-comercio-servicios-acambaro.csv, filtrando por el
 * municipio de Acámbaro, Gto., y escribe los resultados normalizados en
 * data/inegi/denue-candidatos.json - un archivo de STAGING, no un seed.
 *
 * Nunca escribe en src/data/negocios.json: pasar un candidato al directorio
 * real es una decisión explícita, por negocio, que requiere su consentimiento
 * (ver data/inegi/README.md, sección "Próximos pasos").
 *
 * Requiere:
 *   DENUE_TOKEN - token gratuito de https://www.inegi.org.mx/servicios/api_denue.html
 * Uso:
 *   DENUE_TOKEN=xxxx npx tsx scripts/importar-denue.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  construirUrlBuscarAreaAct,
  denueRegistroSchema,
  normalizarRegistroDenue,
  parsearMapaScianCategoria,
  type NegocioCandidatoDenue,
} from "../src/domain/denue.js";

const RAIZ_PAQUETE = join(dirname(fileURLToPath(import.meta.url)), "..");
const TAMANO_PAGINA = 100;
const ENTIDAD_GUANAJUATO = "11";
const MUNICIPIO_ACAMBARO = "002";

/**
 * Un fallo de red (no de HTTP) es poco frecuente pero real en una corrida de
 * ~150 consultas seguidas ("fetch failed" visto en pruebas reales) - un
 * reintento con una pequeña pausa es más barato que perder esa clase SCIAN.
 */
async function consultarConReintento(url: string): Promise<unknown> {
  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    return await respuesta.json();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("HTTP ")) throw error;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`, { cause: error });
    return await respuesta.json();
  }
}

async function main(): Promise<void> {
  const token = process.env.DENUE_TOKEN;
  if (!token) {
    console.error(
      "Falta DENUE_TOKEN. Consigue un token gratuito registrándote en " +
        "https://www.inegi.org.mx/servicios/api_denue.html y expórtalo como variable de entorno.",
    );
    process.exitCode = 1;
    return;
  }

  const csv = readFileSync(
    join(RAIZ_PAQUETE, "data", "inegi", "scian-comercio-servicios-acambaro.csv"),
    "utf-8",
  );
  const mapaCategorias = parsearMapaScianCategoria(csv);
  const clasesScian = [...mapaCategorias.keys()];

  console.log(
    `Consultando DENUE para ${clasesScian.length} clases SCIAN en Acámbaro, Gto. ` +
      `(entidad ${ENTIDAD_GUANAJUATO}, municipio ${MUNICIPIO_ACAMBARO})...`,
  );

  const candidatosPorId = new Map<string, NegocioCandidatoDenue>();
  for (const claveScian of clasesScian) {
    let inicio = 1;
    for (;;) {
      const fin = inicio + TAMANO_PAGINA - 1;
      const url = construirUrlBuscarAreaAct({
        entidad: ENTIDAD_GUANAJUATO,
        municipio: MUNICIPIO_ACAMBARO,
        claveScian,
        inicio,
        fin,
        token,
      });

      let cuerpo: unknown;
      try {
        cuerpo = await consultarConReintento(url);
      } catch (error) {
        console.error(
          `  ✗ ${claveScian}: ${error instanceof Error ? error.message : String(error)}`,
        );
        break;
      }

      // DENUE regresa un string (no un arreglo) cuando la consulta no tiene
      // resultados, en vez de un arreglo vacío - confirmado en una corrida real
      // contra Acámbaro (clases sin ningún negocio registrado, ej. panificación
      // industrial). Se trata como "0 registros", no como error.
      if (typeof cuerpo === "string") {
        console.log(`  · ${claveScian}: sin resultados ("${cuerpo}")`);
        break;
      }

      const resultado = denueRegistroSchema.array().safeParse(cuerpo);
      if (!resultado.success) {
        console.error(
          `  ✗ ${claveScian}: la respuesta no tiene el formato esperado ` +
            "(el schema en src/domain/denue.ts se armó sin poder probarlo contra la API real - revísalo): " +
            resultado.error.message,
        );
        break;
      }

      for (const registro of resultado.data) {
        const candidato = normalizarRegistroDenue(registro, claveScian, mapaCategorias);
        candidatosPorId.set(candidato.fuenteDenueId, candidato);
      }

      console.log(`  ✓ ${claveScian}: ${resultado.data.length} registro(s)`);
      if (resultado.data.length < TAMANO_PAGINA) break;
      inicio += TAMANO_PAGINA;
    }
  }

  const candidatos = [...candidatosPorId.values()];
  const rutaSalida = join(RAIZ_PAQUETE, "data", "inegi", "denue-candidatos.json");
  writeFileSync(
    rutaSalida,
    JSON.stringify(
      {
        generadoEn: new Date().toISOString(),
        municipio: `${ENTIDAD_GUANAJUATO}${MUNICIPIO_ACAMBARO} (Acámbaro, Gto.)`,
        advertencia:
          "Candidatos sin revisar ni consentimiento del negocio. NO usar directamente en " +
          "src/data/negocios.json - ver data/inegi/README.md, sección 'Próximos pasos'.",
        total: candidatos.length,
        candidatos,
      },
      null,
      2,
    ),
    "utf-8",
  );
  console.log(`\n${candidatos.length} candidatos escritos en ${rutaSalida}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
