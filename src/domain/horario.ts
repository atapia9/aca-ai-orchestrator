import type { Dia, Negocio } from "./tipos.js";

const ZONA_HORARIA = "America/Mexico_City";

const DIAS_POR_INDICE: Dia[] = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];

interface MomentoMx {
  dia: Dia;
  minutosDesdeMedianoche: number;
}

function momentoEnMexico(fecha: Date): MomentoMx {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA_HORARIA,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);

  const diaSemana = partes.find((parte) => parte.type === "weekday")?.value ?? "";
  const hora = Number(partes.find((parte) => parte.type === "hour")?.value ?? "0");
  const minuto = Number(partes.find((parte) => parte.type === "minute")?.value ?? "0");

  const indiceIntl: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    dia: DIAS_POR_INDICE[indiceIntl[diaSemana] ?? 0],
    minutosDesdeMedianoche: hora * 60 + minuto,
  };
}

function minutosDesdeHHMM(horaHHMM: string): number {
  const [horas, minutos] = horaHHMM.split(":").map(Number);
  return horas * 60 + minutos;
}

function dentroDeRango(rango: string, minutos: number): boolean {
  const [inicio, fin] = rango.split("-");
  const minutosInicio = minutosDesdeHHMM(inicio);
  const minutosFin = minutosDesdeHHMM(fin);

  if (minutosFin > minutosInicio) {
    return minutos >= minutosInicio && minutos < minutosFin;
  }
  // Rango que cruza la medianoche (p. ej. "20:00-02:00").
  return minutos >= minutosInicio || minutos < minutosFin;
}

export function estaAbiertoEnMomento(negocio: Negocio, dia: Dia, minutos: number): boolean {
  const rangosDelDia = negocio.horario[dia] ?? [];
  return rangosDelDia.some((rango) => dentroDeRango(rango, minutos));
}

export function estaAbiertoAhora(negocio: Negocio, fechaReferencia: Date = new Date()): boolean {
  const { dia, minutosDesdeMedianoche } = momentoEnMexico(fechaReferencia);
  return estaAbiertoEnMomento(negocio, dia, minutosDesdeMedianoche);
}

export function negociosAbiertosEn(
  negocios: Negocio[],
  dia: Dia,
  horaHHMM: string,
): Negocio[] {
  const minutos = minutosDesdeHHMM(horaHHMM);
  return negocios.filter((negocio) => estaAbiertoEnMomento(negocio, dia, minutos));
}
