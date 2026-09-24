export type { AgentContext, CandidatoNegocio, DirectorioConsulta } from "./contexto.js";

export {
  NOMBRE_INVESTIGADOR,
  ejecutarInvestigador,
  investigadorInputSchema,
  type InvestigadorInput,
} from "./investigador.js";
export { NOMBRE_DIAGNOSTICO, ejecutarDiagnostico } from "./diagnostico.js";
export { NOMBRE_ESTRATEGA, ejecutarEstratega } from "./estratega.js";
export { NOMBRE_CONTENIDO, ejecutarContenido, type ContenidoInput } from "./contenido.js";
export { NOMBRE_PROPUESTA, ejecutarPropuesta, type PropuestaInput } from "./propuesta.js";
