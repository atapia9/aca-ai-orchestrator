# Base preliminar INEGI — clasificación de comercio y servicios

> **En una línea:** catálogo SCIAN 2023 (oficial, público) filtrado a los giros que puede tener un directorio de negocios de Acámbaro, como insumo preliminar para preparar el modelo de datos del directorio real (fuera del seed ficticio del MCP).

## ¿Qué es esto y dónde vive?

Esta carpeta es **independiente** del servidor MCP: nada en `src/` la importa ni la lee en tiempo de ejecución. El seed que sí usa el servidor (`src/data/negocios.json`) sigue siendo ficticio, tal como lo exige `CLAUDE.md` y `docs/00-VISION-Y-ALCANCE.md` ("Datos semilla ficticios; los reales solo con consentimiento del negocio").

El propósito de `data/inegi/` es distinto: es material de investigación para preparar la **versión real** del directorio (el proyecto Acambaro.com.mx / ACA-2026-2027 mencionado en `docs/00-VISION-Y-ALCANCE.md`), empezando por la pieza que sí es información pública sin restricciones — la clasificación de actividades económicas — y dejando documentado qué falta para poder incorporar negocios reales más adelante.

## Contenido

### `scian-comercio-servicios-acambaro.csv`

151 clases (nivel más detallado del SCIAN, 6 dígitos) filtradas del catálogo completo (1,086 clases) a los giros plausibles para un directorio de comercio local:

- Subsector **46** completo (comercio al por menor: abarrotes, autoservicio, ropa y calzado, salud, papelería/esparcimiento, enseres domésticos, ferretería/tlapalería, vehículos y refacciones) — excepto el subsector 469 (venta exclusivamente por catálogo/internet, no aplica a un directorio de locales físicos).
- Rama **3118** (panificación y tortillería — en SCIAN, panaderías y tortillerías se clasifican como manufactura, no como comercio, porque elaboran lo que venden).
- Subsector **721** (hoteles, moteles, cabañas, pensiones — Acámbaro tiene turismo).
- Subsector **722** (restaurantes, cafeterías, pizzerías y similares).
- Subsector **811** (talleres y reparación en general: automotriz, calzado, electrodomésticos, tapicería, etc.).
- Subsector **812** (servicios personales: salones de belleza/peluquerías/barberías, lavanderías, funerarias, estacionamientos, etc.).
- Clases **541941–541944** (servicios veterinarios, mascotas y ganadería).

Columnas: `clave_scian`, `nombre_clase_scian`, `rama_cod`, `rama_nombre`, `subsector_cod`, `subsector_nombre`, `categoria_directorio`.

La columna `categoria_directorio` mapea **139 de las 151 clases (92 %)** a 65 categorías: las 11 que **ya existen** en `src/data/negocios.json` / el resource `directorio://categorias` (ver `src/domain/tipos.ts`), más 54 categorías **nuevas propuestas** para giros que Acámbaro seguramente tiene pero que el MVP aún no cubre. `categoria` es un `string` libre en `src/domain/tipos.ts` (no un enum fijo), así que agregar categorías nuevas más adelante no requiere ningún cambio de código, solo datos.

**Las 11 categorías que ya existen en el MVP:**

| categoria_directorio | claves SCIAN                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cafeteria`          | 722515                                                                                                                                           |
| `restaurante`        | 722511, 722512, 722513, 722514, 722516, 722518, 722519                                                                                           |
| `pizzeria`           | 722517                                                                                                                                           |
| `panaderia`          | 311812                                                                                                                                           |
| `ferreteria`         | 467111, 467112, 467113, 467114, 467115, 467116, 467117 (toda la rama 4671: ferretería, tlapalería, pintura, vidrios, materiales de construcción) |
| `farmacia`           | 464111, 464112, 463217 (pañales, venta típica de farmacia/minisúper)                                                                             |
| `taller_mecanico`    | 811111–811199 (toda la rama 8111, reparación automotriz)                                                                                         |
| `tienda_ropa`        | 463211, 463212, 463213, 463214, 463216, 463218                                                                                                   |
| `papeleria`          | 465311, 465313 (papelería, revistas y periódicos)                                                                                                |
| `veterinaria`        | 541941, 541942 (mascotas), 541943, 541944 (ganadería)                                                                                            |
| `salon_belleza`      | 812110 (incluye peluquerías y barberías: el SCIAN no las separa)                                                                                 |

**54 categorías nuevas propuestas** (agrupadas por tema; cada una con 1-8 clases SCIAN — el detalle exacto está en el CSV, columna `categoria_directorio`):

- **Alimentos frescos y de barrio:** `abarrotes`, `carniceria`, `pescaderia`, `fruteria`, `cremeria`, `dulceria`, `paleteria`, `licoreria`, `tortilleria`.
- **Autoservicio y tiendas grandes:** `supermercado`, `minisuper`, `tienda_departamental`, `segunda_mano`.
- **Ropa, calzado y accesorios:** `merceria`, `joyeria`, `zapateria`.
- **Salud y cuidado personal:** `tienda_naturista`, `optica`, `ortopedia`, `perfumeria`.
- **Esparcimiento y regalos:** `jugueteria`, `bicicletas`, `foto_estudio`, `tienda_deportiva`, `tienda_musical`, `libreria`, `tienda_mascotas`, `regalos`, `articulos_religiosos`.
- **Hogar y tecnología:** `muebleria`, `electrodomesticos`, `computadoras`, `telefonia`, `decoracion`, `floreria`.
- **Vehículos y combustibles:** `agencia_autos`, `refaccionaria`, `llantera`, `motos`, `gasolinera`, `gasera`.
- **Hospedaje y alimentos fuera de casa:** `hospedaje` (hoteles, moteles, cabañas, pensiones), `banquetes`, `comida_movil`, `vida_nocturna`, `bar`.
- **Reparación y servicios personales:** `reparacion_electronicos`, `reparacion_electrodomesticos`, `tapiceria`, `reparacion_calzado`, `cerrajeria`, `lavanderia`, `funeraria`, `estacionamiento`.

**Las 12 clases que quedan sin mapear** son, a propósito, las que no encajan bien en un directorio de comercio local de cara al público:

| clave_scian   | nombre                                                     | por qué queda fuera                                                                                   |
| ------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 311811        | Panificación industrial                                    | escala de fábrica, no un local de barrio (distinto de `panaderia` = 311812, panificación tradicional) |
| 311820        | Elaboración de galletas y pastas para sopa                 | igual: producción industrial, no venta directa al público                                             |
| 465211        | Grabaciones de audio y video en medios físicos             | formato en desuso, muy poco probable como negocio activo hoy                                          |
| 722310        | Servicios de comedor para empresas e instituciones         | contrato B2B (comedores industriales), no un local al que el público entra                            |
| 811311–811314 | Reparación de maquinaria agropecuaria/industrial/comercial | servicio B2B especializado, no un giro típico de directorio al consumidor                             |
| 811499        | Otros artículos para el hogar y personales (reparación)    | cajón "otros", demasiado ambiguo para una categoría propia                                            |
| 812120        | Baños públicos                                             | infraestructura pública, no un negocio privado típico                                                 |
| 812130        | Sanitarios públicos y bolerías                             | ídem, categoría compuesta y poco frecuente                                                            |
| 812990        | Otros servicios personales                                 | cajón "otros", demasiado ambiguo                                                                      |

Si en el futuro aparece un negocio real de Acámbaro que caiga en una de estas clases, lo razonable es crear la categoría en ese momento (con el nombre real del negocio como referencia) en vez de adivinar una ahora.

## Fuente y método

- **Fuente oficial:** [`estructura2023.xlsx`](https://www.inegi.org.mx/contenidos/app/scian/estructura2023.xlsx), publicado por INEGI en <https://www.inegi.org.mx/scian/> (Sistema de Clasificación Industrial de América del Norte, México, SCIAN 2023).
- **Fecha de descarga:** 2026-09-17.
- **Método:** el archivo se descargó directamente del dominio oficial `inegi.org.mx` y se parseó localmente (XML interno del `.xlsx`, sin librerías externas) para extraer las 1,086 clases con su jerarquía completa (sector → subsector → rama → clase). De ahí se filtró el subconjunto de este CSV.
- **Por qué no se usaron resúmenes de búsqueda web:** al buscar las claves SCIAN por texto, distintas fuentes (incluyendo resúmenes generados por IA de páginas de terceros) daban códigos **contradictorios** para el mismo giro (p. ej. ferretería apareció como 465111, 467111 y 468311 según la fuente; veterinaria como 541941 y como 541 “genérico”). Por eso se descartaron esas fuentes secundarias y se volvió a la tabla oficial de INEGI como única fuente de verdad, verificada campo por campo antes de guardarla aquí.

## Qué NO incluye (todavía)

Este catálogo es **solo clasificación**, no hay ningún negocio individual real (nombre, dirección, teléfono, etc.). Los registros reales de unidades económicas viven en el **DENUE** (Directorio Estadístico Nacional de Unidades Económicas) de INEGI, que es un dataset distinto y requiere uno de estos dos caminos, ninguno disponible en este entorno de trabajo:

1. **API DENUE** (`inegi.org.mx/servicios/api_denue.html`): requiere un token gratuito que se obtiene registrando una cuenta en el sitio de INEGI — un paso que solo puede hacer una persona, no un asistente automatizado.
2. **Descarga masiva**: la herramienta oficial de INEGI para descarga masiva por municipio es un ejecutable de Windows (`DescargaMasivaApp.exe`), no ejecutable desde este entorno.

## Herramienta de importación (`scripts/importar-denue.ts`)

`pnpm importar-denue` (con `DENUE_TOKEN` en el ambiente) consulta `BuscarAreaAct` del DENUE por cada clase SCIAN ya mapeada en `scian-comercio-servicios-acambaro.csv`, filtrando por el municipio de Acámbaro (entidad `11` = Guanajuato, municipio `002` = Acámbaro), normaliza los resultados contra `src/domain/denue.ts` y los escribe en `data/inegi/denue-candidatos.json` — un archivo de **staging**, marcado explícitamente como "sin revisar ni consentimiento". El script nunca toca `src/data/negocios.json`.

**Verificado contra la API real** (2026-09-24, con token real de Armando, corrido desde su máquina porque este entorno de trabajo bloquea el acceso saliente a `inegi.org.mx` por política de red): **4316 candidatos** para Acámbaro, sin errores. El schema de `src/domain/denue.ts` — reconstruido de fuentes secundarias, sin poder leer la documentación oficial directamente — resultó correcto. Un hallazgo real de esa corrida: DENUE regresa el string `"No hay resultados. "` (no un arreglo vacío) cuando una clase SCIAN no tiene ningún negocio registrado en el área consultada; `scripts/importar-denue.ts` ya lo reconoce como "0 registros" en vez de tratarlo como error.

## Próximos pasos (cuando se retome)

1. ~~Registrar una cuenta en INEGI y obtener el token gratuito de la API DENUE.~~
2. ~~Correr `pnpm importar-denue` con el token real.~~ Hecho — `data/inegi/denue-candidatos.json` tiene 4316 candidatos (no versionado en git por su tamaño y porque son datos reales sin consentimiento; regenerable con `pnpm importar-denue`).
3. Completar a mano, por negocio, los campos que `Negocio` (`src/domain/tipos.ts`) necesita y DENUE no trae (horario, WhatsApp, redes sociales, etiquetas) — probablemente vía contacto directo con cada negocio.
4. Decidir explícitamente, y solo entonces, si algún candidato de `denue-candidatos.json` pasa a `src/data/negocios.json` — lo que implica actualizar la política de "datos ficticios" en `CLAUDE.md` y `docs/00-VISION-Y-ALCANCE.md`, y obtener el consentimiento del negocio antes de publicar sus datos de contacto.
