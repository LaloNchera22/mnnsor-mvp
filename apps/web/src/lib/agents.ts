/**
 * Catálogo de agentes de mnnsor.
 *
 * Todos los agentes comparten un mismo motor (entrada cruda → documento
 * formal). Cada agente es SOLO una configuración: nombre, tipo de documento,
 * las secciones que produce y metadatos de UI (pista y ejemplo de captura).
 * Agregar un agente nuevo = una entrada aquí, no código nuevo.
 *
 * En fases posteriores esta config crece con: prompt de sistema, JSON schema
 * de salida y bloque de firmas.
 */

export type DocType =
  | "atlas"
  | "bitacora"
  | "permiso"
  | "plan"
  | "minuta"
  | "ast"
  | "orden_compra"
  | "reporte_fotografico";

export interface AgentConfig {
  docType: DocType;
  /** Nombre corto para etiquetas y folios (mono). */
  slug: string;
  nombre: string;
  descripcion: string;
  /** Agrupación para el menú lateral y filtros. */
  categoria: "Campo" | "Seguridad" | "Coordinación" | "Compras";
  /** Secciones que el documento formal contiene (ver §4 de la spec). */
  secciones: string[];
  /** Texto de ayuda bajo el área de captura. */
  pista: string;
  /** Ejemplo de notas crudas que rellena el placeholder / botón "usar ejemplo". */
  ejemplo: string;
  /** Marca si el agente es el principal por defecto (ej. punto de entrada). */
  isFlagship?: boolean;
}

export const AGENTS: AgentConfig[] = [
  {
    docType: "atlas",
    slug: "ATL",
    nombre: "Atlas",
    descripcion:
      "Documento técnico formal con procedencia visible y bloque de gobernanza (propone → revisa → aprueba).",
    categoria: "Coordinación",
    secciones: [
      "Resumen ejecutivo",
      "Alcance",
      "Hallazgos / análisis",
      "Propuesta",
      "Riesgos y supuestos",
      "Aprobaciones (elaboró · revisó · autorizó)",
    ],
    pista:
      "Escribe tus notas de campo o adjunta documentación para generar el documento técnico.",
    ejemplo:
      "Revisión de planos estructurales nivel 2, encontramos discrepancia en trabe T-4. Proponemos reforzar con placa de acero de 1/2 pulgada. Riesgo de retraso si no se aprueba hoy.",
    isFlagship: true,
  },
  {
    docType: "bitacora",
    slug: "BIT",
    nombre: "Bitácora de obra",
    descripcion: "Registro diario de condiciones, personal, actividades y avance.",
    categoria: "Campo",
    secciones: [
      "Condiciones / clima",
      "Personal",
      "Actividades",
      "Materiales",
      "Maquinaria",
      "Incidencias",
      "Instrucciones",
      "Avance",
    ],
    pista:
      "Escribe como hablas en campo. Clima, cuánta gente, qué se hizo, materiales, maquinaria e incidencias.",
    ejemplo:
      "clima despejado 28°, 14 trabajadores, colado de losa nivel 3 eje C-F, 42 m3 concreto f'c 250, vibrado ok, se retrasó la bomba 40 min, sin incidentes de seguridad",
  },
  {
    docType: "permiso",
    slug: "PT",
    nombre: "Permiso de trabajo",
    descripcion: "Autorización de trabajo con riesgos, controles y EPP.",
    categoria: "Seguridad",
    secciones: ["Tipo", "Ubicación", "Descripción", "Riesgos", "Controles", "EPP", "Condiciones"],
    pista: "Di qué trabajo se autoriza, dónde, los riesgos y los controles.",
    ejemplo:
      "permiso trabajo en caliente, soldadura de estructura en azotea, riesgo de incendio y chispas, extintor a la mano, retirar material combustible 10 m, careta y guantes de carnaza",
  },
  {
    docType: "plan",
    slug: "PL",
    nombre: "Plan de trabajo",
    descripcion: "Objetivo, alcance, secuencia de actividades y recursos.",
    categoria: "Coordinación",
    secciones: ["Objetivo", "Alcance", "Actividades / secuencia", "Recursos", "Entregables", "Duración", "Riesgos"],
    pista: "Cuenta el objetivo, el alcance, la secuencia y los recursos que necesitas.",
    ejemplo:
      "plan para impermeabilización de azotea torre B, 620 m2, limpiar y reparar grietas, imprimante, membrana prefabricada, cuadrilla de 4, 3 días, riesgo de lluvia",
  },
  {
    docType: "minuta",
    slug: "MIN",
    nombre: "Minuta de reunión",
    descripcion: "Asistentes, temas tratados, acuerdos y pendientes.",
    categoria: "Coordinación",
    secciones: ["Asunto", "Asistentes", "Temas", "Acuerdos", "Pendientes (responsable / fecha)", "Próxima reunión"],
    pista: "Quién asistió, qué se trató, los acuerdos y los pendientes con responsable y fecha.",
    ejemplo:
      "reunión coordinación MEP, asistieron residente, instalador hidrosanitario y eléctrico, acuerdo liberar registros antes del viernes, pendiente planos as-built eléctrico responsable Juan 22 ago",
  },
  {
    docType: "ast",
    slug: "AST",
    nombre: "Análisis de Seguridad en el Trabajo",
    descripcion: "Etapas, peligros y controles del trabajo a ejecutar.",
    categoria: "Seguridad",
    secciones: ["Descripción", "EPP", "Etapas (etapa · peligro · control)", "Observaciones"],
    pista: "Describe el trabajo; separa las etapas y para cada una el peligro y su control.",
    ejemplo:
      "AST montaje de andamio fachada norte, riesgo de caída a distinto nivel, arnés con doble línea, línea de vida, delimitar el área abajo, casco con barbiquejo",
  },
  {
    docType: "orden_compra",
    slug: "OC",
    nombre: "Orden de compra",
    descripcion: "Partidas por cantidad, unidad y descripción — sin inventar precios.",
    categoria: "Compras",
    secciones: ["Partidas (cantidad · unidad · descripción)", "Proveedor sugerido", "Entrega", "Observaciones"],
    pista: "Lista las partidas con cantidad y unidad. mnnsor no inventa precios.",
    ejemplo:
      "2 ton varilla 3/8, 1.5 ton varilla 1/2, 50 kg alambre recocido, entrega en obra Altozano antes del jueves",
  },
  {
    docType: "reporte_fotografico",
    slug: "RF",
    nombre: "Reporte fotográfico",
    descripcion: "Descripción técnica por foto (visión) y resumen.",
    categoria: "Campo",
    secciones: ["Descripción por foto", "Resumen"],
    pista: "Describe qué muestra cada foto; mnnsor arma la descripción técnica y el resumen.",
    ejemplo:
      "foto 1 avance de cimentación zapata Z-4, foto 2 armado de columna C-2 listo para colar, foto 3 acopio de material en patio",
  },
];

export function getAgent(docType: DocType): AgentConfig | undefined {
  return AGENTS.find((a) => a.docType === docType);
}

export function isDocType(v: string): v is DocType {
  return AGENTS.some((a) => a.docType === v);
}
