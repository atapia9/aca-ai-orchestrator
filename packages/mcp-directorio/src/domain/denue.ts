import { z } from "zod";

/**
 * Forma de un registro tal como lo regresa `BuscarAreaAct` de la API del
 * DENUE (INEGI). Nombres de campo reconstruidos de fuentes secundarias
 * (documentación indexada por buscadores y bibliotecas de terceros) porque
 * este entorno no tiene acceso de red a inegi.org.mx y todavía no hay un
 * token para probar contra la API real (ver data/inegi/README.md). Antes de
 * usarse contra datos reales: correr una consulta de prueba y corregir aquí
 * cualquier campo que no calce - por diseño, un campo requerido que no
 * aparezca en la respuesta real debe tronar el parseo (zod), no producir un
 * candidato con datos incompletos en silencio.
 */
export const denueRegistroSchema = z.object({
  Id: z.string(),
  CLEE: z.string(),
  Nombre: z.string(),
  Razon_social: z.string().optional(),
  Clase_actividad: z.string(),
  Id_clase_actividad: z.string().optional(),
  Estrato: z.string().optional(),
  Tipo_vialidad: z.string().optional(),
  Calle: z.string(),
  Num_Exterior: z.string().optional(),
  Num_Interior: z.string().optional(),
  Colonia: z.string(),
  CP: z.string().optional(),
  Localidad: z.string().optional(),
  Municipio: z.string().optional(),
  Entidad: z.string().optional(),
  Telefono: z.string().optional(),
  Correo_e: z.string().optional(),
  Sitio_internet: z.string().optional(),
  Tipo: z.string().optional(),
  Longitud: z.string().optional(),
  Latitud: z.string().optional(),
});
export type DenueRegistro = z.infer<typeof denueRegistroSchema>;

/**
 * Candidato normalizado a partir de un registro DENUE. Deliberadamente NO es
 * un `Negocio` (src/domain/tipos.ts): le faltan campos que DENUE no trae
 * (ver `camposPendientes`) y no ha pasado por la decisión explícita de
 * consentimiento que exige incorporar un negocio real al directorio (ver
 * data/inegi/README.md, sección "Próximos pasos").
 */
export interface NegocioCandidatoDenue {
  fuenteDenueId: string;
  clee: string;
  nombre: string;
  categoriaSugerida: string | undefined;
  claveScian: string;
  descripcionActividad: string;
  direccion: string;
  colonia: string;
  telefono: string | undefined;
  sitioWeb: string | undefined;
  coordenadas: { lat: number; lon: number } | undefined;
  estrato: string | undefined;
  camposPendientes: readonly string[];
}

/** `Negocio` requiere estos campos y DENUE no los trae - hay que completarlos a mano. */
export const CAMPOS_QUE_DENUE_NO_TRAE: readonly string[] = [
  "whatsapp",
  "horario",
  "redes",
  "etiquetas",
];

export function normalizarRegistroDenue(
  registro: DenueRegistro,
  claveScianACategoria: ReadonlyMap<string, string>,
): NegocioCandidatoDenue {
  const direccion = [
    [registro.Tipo_vialidad, registro.Calle].filter(Boolean).join(" ").trim(),
    registro.Num_Exterior ? `#${registro.Num_Exterior}` : undefined,
    registro.Num_Interior ? `Int. ${registro.Num_Interior}` : undefined,
  ]
    .filter((parte): parte is string => Boolean(parte))
    .join(" ");

  const lat = registro.Latitud ? Number(registro.Latitud) : undefined;
  const lon = registro.Longitud ? Number(registro.Longitud) : undefined;
  const coordenadas =
    lat !== undefined && lon !== undefined && !Number.isNaN(lat) && !Number.isNaN(lon)
      ? { lat, lon }
      : undefined;

  return {
    fuenteDenueId: registro.Id,
    clee: registro.CLEE,
    nombre: registro.Nombre,
    categoriaSugerida: registro.Id_clase_actividad
      ? claveScianACategoria.get(registro.Id_clase_actividad)
      : undefined,
    claveScian: registro.Id_clase_actividad ?? "",
    descripcionActividad: registro.Clase_actividad,
    direccion: direccion || registro.Calle,
    colonia: registro.Colonia,
    telefono: registro.Telefono || undefined,
    sitioWeb: registro.Sitio_internet || undefined,
    coordenadas,
    estrato: registro.Estrato || undefined,
    camposPendientes: CAMPOS_QUE_DENUE_NO_TRAE,
  };
}

/**
 * Parser mínimo de CSV (RFC 4180: comillas dobles para campos con comas,
 * `""` como comilla escapada) - el catálogo SCIAN tiene descripciones con
 * comas, así que un split(",") ingenuo desalinea columnas.
 */
function parsearFilaCsv(fila: string): string[] {
  const columnas: string[] = [];
  let actual = "";
  let entreComillas = false;
  for (let i = 0; i < fila.length; i++) {
    const c = fila[i];
    if (entreComillas) {
      if (c === '"' && fila[i + 1] === '"') {
        actual += '"';
        i++;
      } else if (c === '"') {
        entreComillas = false;
      } else {
        actual += c;
      }
    } else if (c === '"') {
      entreComillas = true;
    } else if (c === ",") {
      columnas.push(actual);
      actual = "";
    } else {
      actual += c;
    }
  }
  columnas.push(actual);
  return columnas;
}

/**
 * Lee el catálogo `data/inegi/scian-comercio-servicios-acambaro.csv` (clave_scian,
 * ...,  categoria_directorio) y regresa solo las clases ya mapeadas a una
 * categoría del directorio.
 */
export function parsearMapaScianCategoria(csv: string): Map<string, string> {
  const mapa = new Map<string, string>();
  const [, ...filas] = csv.trim().split("\n");
  for (const fila of filas) {
    if (!fila.trim()) continue;
    const columnas = parsearFilaCsv(fila);
    const claveScian = columnas[0];
    const categoria = columnas[6];
    if (claveScian && categoria) mapa.set(claveScian, categoria);
  }
  return mapa;
}

const BASE_URL_BUSCAR_AREA_ACT = "https://www.inegi.org.mx/app/api/denue/v1/consulta/BuscarAreaAct";

export interface BuscarAreaActParams {
  /** Clave de entidad federativa INEGI (Guanajuato = "11"). */
  entidad: string;
  /** Clave de municipio INEGI dentro de la entidad (Acámbaro = "002"). */
  municipio: string;
  claveScian: string;
  /** Rango de resultados a traer (1-indexado), para paginar. */
  inicio: number;
  fin: number;
  token: string;
}

/**
 * Construye la URL de `BuscarAreaAct`. Filtra por entidad + municipio + la
 * clase SCIAN dada; deja localidad/ageb/manzana/sector/subsector/rama/nombre/
 * estrato sin restringir ("0", el comodín documentado de este endpoint).
 */
export function construirUrlBuscarAreaAct(params: BuscarAreaActParams): string {
  const segmentos = [
    params.entidad,
    params.municipio,
    "0", // localidad
    "0", // ageb
    "0", // manzana
    "0", // sector
    "0", // subsector
    "0", // rama
    params.claveScian,
    "0", // nombre (sin filtro de texto)
    String(params.inicio),
    String(params.fin),
    "0", // estrato (todos los tamaños de personal ocupado)
    params.token,
  ];
  return `${BASE_URL_BUSCAR_AREA_ACT}/${segmentos.join("/")}`;
}
