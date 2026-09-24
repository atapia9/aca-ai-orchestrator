import { describe, expect, it } from "vitest";
import {
  construirUrlBuscarAreaAct,
  denueRegistroSchema,
  normalizarRegistroDenue,
  parsearMapaScianCategoria,
  type DenueRegistro,
} from "../../src/domain/denue.js";

const registroBase: DenueRegistro = {
  Id: "12345678",
  CLEE: "111234567890123",
  Nombre: "Panadería La Espiga",
  Clase_actividad: "Panificación tradicional",
  Calle: "Hidalgo",
  Colonia: "Centro",
  Tipo_vialidad: "Calle",
  Num_Exterior: "45",
  Telefono: "4181234567",
  Sitio_internet: "",
  Latitud: "20.03642",
  Longitud: "-100.72694",
  Estrato: "0 a 5 personas",
};

describe("denueRegistroSchema", () => {
  it("acepta un registro con solo los campos requeridos", () => {
    const minimo = { Id: "1", CLEE: "x", Nombre: "x", Clase_actividad: "x", Calle: "x", Colonia: "x" };
    expect(denueRegistroSchema.safeParse(minimo).success).toBe(true);
  });

  it("rechaza un registro sin Nombre", () => {
    const { Nombre: _nombre, ...sinNombre } = registroBase;
    expect(denueRegistroSchema.safeParse(sinNombre).success).toBe(false);
  });
});

describe("normalizarRegistroDenue", () => {
  const mapaCategorias = new Map([["311812", "panaderia"]]);

  it("arma la dirección a partir de tipo de vialidad + calle + número exterior", () => {
    const candidato = normalizarRegistroDenue(registroBase, "311812", mapaCategorias);
    expect(candidato.direccion).toBe("Calle Hidalgo #45");
  });

  it("usa la clave SCIAN consultada (no viene en la respuesta real) y mapea su categoría", () => {
    const candidato = normalizarRegistroDenue(registroBase, "311812", mapaCategorias);
    expect(candidato.categoriaSugerida).toBe("panaderia");
    expect(candidato.claveScian).toBe("311812");
  });

  it("deja categoriaSugerida sin definir si la clave SCIAN no está en el catálogo", () => {
    const candidato = normalizarRegistroDenue(registroBase, "311812", new Map());
    expect(candidato.categoriaSugerida).toBeUndefined();
  });

  it("convierte latitud/longitud a números", () => {
    const candidato = normalizarRegistroDenue(registroBase, "311812", mapaCategorias);
    expect(candidato.coordenadas).toEqual({ lat: 20.03642, lon: -100.72694 });
  });

  it("deja coordenadas sin definir si latitud/longitud vienen vacías", () => {
    const candidato = normalizarRegistroDenue(
      { ...registroBase, Latitud: "", Longitud: "" },
      "311812",
      mapaCategorias,
    );
    expect(candidato.coordenadas).toBeUndefined();
  });

  it("trata sitio_internet vacío como sin sitio web", () => {
    const candidato = normalizarRegistroDenue(registroBase, "311812", mapaCategorias);
    expect(candidato.sitioWeb).toBeUndefined();
  });

  it("siempre marca los campos que Negocio necesita y DENUE no trae", () => {
    const candidato = normalizarRegistroDenue(registroBase, "311812", mapaCategorias);
    expect(candidato.camposPendientes).toEqual(["whatsapp", "horario", "redes", "etiquetas"]);
  });
});

describe("parsearMapaScianCategoria", () => {
  it("ignora filas sin categoría asignada", () => {
    const csv = [
      "clave_scian,nombre_clase_scian,rama_cod,rama_nombre,subsector_cod,subsector_nombre,categoria_directorio",
      "311811,Panificación industrial,3118,x,311,x,",
      "311812,Panificación tradicional,3118,x,311,x,panaderia",
    ].join("\n");
    const mapa = parsearMapaScianCategoria(csv);
    expect(mapa.get("311811")).toBeUndefined();
    expect(mapa.get("311812")).toBe("panaderia");
  });

  it("respeta comas dentro de campos entre comillas", () => {
    const csv = [
      "clave_scian,nombre_clase_scian,rama_cod,rama_nombre,subsector_cod,subsector_nombre,categoria_directorio",
      '463211,"Comercio al por menor de ropa, bisutería y accesorios",4632,x,463,x,tienda_ropa',
    ].join("\n");
    const mapa = parsearMapaScianCategoria(csv);
    expect(mapa.get("463211")).toBe("tienda_ropa");
  });
});

describe("construirUrlBuscarAreaAct", () => {
  it("arma la URL con entidad, municipio y clase SCIAN en las posiciones documentadas", () => {
    const url = construirUrlBuscarAreaAct({
      entidad: "11",
      municipio: "002",
      claveScian: "311812",
      inicio: 1,
      fin: 100,
      token: "TOKEN123",
    });
    expect(url).toBe(
      "https://www.inegi.org.mx/app/api/denue/v1/consulta/BuscarAreaAct/11/002/0/0/0/0/0/0/311812/0/1/100/0/TOKEN123",
    );
  });
});
