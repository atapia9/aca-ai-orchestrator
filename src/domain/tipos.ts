export type Dia = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

export interface Redes {
  facebook?: string;
  instagram?: string;
  google_maps?: string;
}

export interface Negocio {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  direccion: string;
  colonia: string;
  telefono?: string;
  whatsapp?: string;
  sitio_web?: string;
  redes?: Redes;
  horario: Record<Dia, string[]>;
  etiquetas: string[];
  actualizado: string;
}
