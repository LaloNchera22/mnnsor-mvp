/**
 * Catálogo de agentes de mnnsor.
 *
 * Todos los agentes comparten un mismo motor (entrada cruda → documento
 * formal). Cada agente es SOLO una configuración: nombre, tipo de documento,
 * y las secciones que produce. Agregar un agente nuevo = una entrada aquí,
 * no código nuevo.
 *
 * En fases posteriores esta config crece con: prompt de sistema, JSON schema
 * de salida y bloque de firmas. Por ahora describe el catálogo que pinta el
 * dashboard.
 */

export type DocType =
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
  /** Secciones que el documento formal contiene (ver §4 de la spec). */
  secciones: string[];
}

export const AGENTS: AgentConfig[] = [
  {
    docType: "bitacora",
    slug: "BIT",
    nombre: "Bitácora de obra",
    descripcion: "Registro diario de condiciones, personal, actividades y avance.",
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
  },
  {
    docType: "permiso",
    slug: "PT",
    nombre: "Permiso de trabajo",
    descripcion: "Autorización de trabajo con riesgos, controles y EPP.",
    secciones: [
      "Tipo",
      "Ubicación",
      "Descripción",
      "Riesgos",
      "Controles",
      "EPP",
      "Condiciones",
    ],
  },
  {
    docType: "plan",
    slug: "PL",
    nombre: "Plan de trabajo",
    descripcion: "Objetivo, alcance, secuencia de actividades y recursos.",
    secciones: [
      "Objetivo",
      "Alcance",
      "Actividades / secuencia",
      "Recursos",
      "Entregables",
      "Duración",
      "Riesgos",
    ],
  },
  {
    docType: "minuta",
    slug: "MIN",
    nombre: "Minuta de reunión",
    descripcion: "Asistentes, temas tratados, acuerdos y pendientes.",
    secciones: [
      "Asunto",
      "Asistentes",
      "Temas",
      "Acuerdos",
      "Pendientes (responsable / fecha)",
      "Próxima reunión",
    ],
  },
  {
    docType: "ast",
    slug: "AST",
    nombre: "Análisis de Seguridad en el Trabajo",
    descripcion: "Etapas, peligros y controles del trabajo a ejecutar.",
    secciones: [
      "Descripción",
      "EPP",
      "Etapas (etapa · peligro · control)",
      "Observaciones",
    ],
  },
  {
    docType: "orden_compra",
    slug: "OC",
    nombre: "Orden de compra",
    descripcion: "Partidas por cantidad, unidad y descripción — sin inventar precios.",
    secciones: [
      "Partidas (cantidad · unidad · descripción)",
      "Proveedor sugerido",
      "Entrega",
      "Observaciones",
    ],
  },
  {
    docType: "reporte_fotografico",
    slug: "RF",
    nombre: "Reporte fotográfico",
    descripcion: "Descripción técnica por foto (visión) y resumen.",
    secciones: ["Descripción por foto", "Resumen"],
  },
];

export function getAgent(docType: DocType): AgentConfig | undefined {
  return AGENTS.find((a) => a.docType === docType);
}
