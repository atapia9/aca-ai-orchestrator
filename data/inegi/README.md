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

La columna `categoria_directorio` mapea 34 de esas clases a las 11 categorías que **ya existen** en `src/data/negocios.json` / el resource `directorio://categorias` (ver `src/domain/tipos.ts`):

| categoria_directorio | claves SCIAN |
|---|---|
| `cafeteria` | 722515 |
| `restaurante` | 722511, 722512, 722513, 722514, 722516, 722518, 722519 |
| `pizzeria` | 722517 |
| `panaderia` | 311812 |
| `ferreteria` | 467111 |
| `farmacia` | 464111, 464112 |
| `taller_mecanico` | 811111, 811112, 811113, 811114, 811115, 811116, 811119, 811121, 811122, 811123, 811129, 811191, 811192, 811199 (toda la rama 8111, reparación automotriz) |
| `tienda_ropa` | 463211, 463212, 463216 |
| `papeleria` | 465311 |
| `veterinaria` | 541941, 541942 |
| `salon_belleza` | 812110 (incluye peluquerías y barberías: el SCIAN no las separa) |

Las otras 117 filas quedan con `categoria_directorio` vacío: son giros reales y frecuentes en una ciudad como Acámbaro (tiendas de abarrotes, carnicerías, fruterías, tortillerías, hoteles, lavanderías, ferreterías especializadas en pintura/vidrio, ópticas, papelerías con venta de libros, etc.) que **todavía no tienen categoría propia** en el MVP. Quedan documentadas como candidatas para cuando se amplíe el catálogo de categorías.

## Fuente y método

- **Fuente oficial:** [`estructura2023.xlsx`](https://www.inegi.org.mx/contenidos/app/scian/estructura2023.xlsx), publicado por INEGI en <https://www.inegi.org.mx/scian/> (Sistema de Clasificación Industrial de América del Norte, México, SCIAN 2023).
- **Fecha de descarga:** 2026-09-17.
- **Método:** el archivo se descargó directamente del dominio oficial `inegi.org.mx` y se parseó localmente (XML interno del `.xlsx`, sin librerías externas) para extraer las 1,086 clases con su jerarquía completa (sector → subsector → rama → clase). De ahí se filtró el subconjunto de este CSV.
- **Por qué no se usaron resúmenes de búsqueda web:** al buscar las claves SCIAN por texto, distintas fuentes (incluyendo resúmenes generados por IA de páginas de terceros) daban códigos **contradictorios** para el mismo giro (p. ej. ferretería apareció como 465111, 467111 y 468311 según la fuente; veterinaria como 541941 y como 541 “genérico”). Por eso se descartaron esas fuentes secundarias y se volvió a la tabla oficial de INEGI como única fuente de verdad, verificada campo por campo antes de guardarla aquí.

## Qué NO incluye (todavía)

Este catálogo es **solo clasificación**, no hay ningún negocio individual real (nombre, dirección, teléfono, etc.). Los registros reales de unidades económicas viven en el **DENUE** (Directorio Estadístico Nacional de Unidades Económicas) de INEGI, que es un dataset distinto y requiere uno de estos dos caminos, ninguno disponible en este entorno de trabajo:

1. **API DENUE** (`inegi.org.mx/servicios/api_denue.html`): requiere un token gratuito que se obtiene registrando una cuenta en el sitio de INEGI — un paso que solo puede hacer una persona, no un asistente automatizado.
2. **Descarga masiva**: la herramienta oficial de INEGI para descarga masiva por municipio es un ejecutable de Windows (`DescargaMasivaApp.exe`), no ejecutable desde este entorno.

## Próximos pasos (cuando se retome)

1. Registrar una cuenta en INEGI y obtener el token gratuito de la API DENUE.
2. Con el token, consultar DENUE filtrando por el municipio de Acámbaro (clave de entidad 11 = Guanajuato) y, opcionalmente, por las claves SCIAN de este catálogo.
3. Normalizar los campos que devuelve DENUE (nombre, calle, colonia, teléfono, correo, sitio web, coordenadas, estrato de personal) contra el tipo `Negocio` de `src/domain/tipos.ts`, y completar los campos que el MVP necesita y DENUE no trae (horario, WhatsApp, redes sociales, etiquetas) — probablemente vía contacto directo con cada negocio.
4. Decidir explícitamente, y solo entonces, si algún registro real pasa a `src/data/negocios.json` — lo que implica actualizar la política de "datos ficticios" en `CLAUDE.md` y `docs/00-VISION-Y-ALCANCE.md`, y obtener el consentimiento del negocio antes de publicar sus datos de contacto.
