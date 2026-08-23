import type { AgentConfig } from "@/lib/agents";
import { formatDate } from "@/lib/utils";

/*
 * Modelo de documento y generador de demostración.
 *
 * En producción, la generación es una llamada a la Anthropic API (Claude)
 * desde el servidor —Server Action / route handler, con Supabase como base de
 * datos y Vercel como hosting— que transforma las notas crudas en el documento
 * formal siguiendo el schema del agente, con streaming de tokens.
 *
 * Aquí armamos un documento verosímil y ESTRUCTURADO (secciones tipadas con
 * su procedencia) para poder ejercitar toda la UI/UX del flujo sin backend:
 * captura → streaming → vista papel → edición inline → regenerar por sección →
 * exportación, marcando qué salió de las notas y qué es estructura.
 */

/** De dónde salió el contenido de una sección. */
export type Provenance = "notas" | "estructura";

export interface DocSection {
  id: string;
  numero: number;
  heading: string;
  body: string;
  /** "notas": redactado a partir de lo que el usuario dictó/escribió.
   *  "estructura": andamiaje del formato, sin dato del usuario. */
  source: Provenance;
}

export interface DocMeta {
  obra: string;
  cliente: string;
  ubicacion: string;
  fecha: string;
}

export interface StructuredDoc {
  titulo: string;
  agentNombre: string;
  meta: DocMeta;
  sections: DocSection[];
}

/** Foto adjunta a un reporte fotográfico (demo: data URL en el cliente). */
export interface Photo {
  id: string;
  dataUrl: string;
  caption: string;
}

/** Compat: algunos flujos siguen consumiendo `{ titulo, markdown }`. */
export interface GeneratedDoc {
  titulo: string;
  markdown: string;
}

function frasesDe(notas: string): string[] {
  return notas
    .split(/[.,;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

function capitaliza(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Conectores para dar variedad al regenerar una sección (demo). */
const CONECTORES = [
  "",
  "Se registra que ",
  "Durante la jornada, ",
  "De acuerdo con lo observado, ",
  "En este apartado, ",
];

function redactaSeccion(frase: string | undefined, variante: number): {
  body: string;
  source: Provenance;
} {
  if (!frase) {
    return {
      body: "Sin información capturada para esta sección.",
      source: "estructura",
    };
  }
  const conector = CONECTORES[variante % CONECTORES.length];
  const cuerpo = conector ? conector + frase : capitaliza(frase);
  return { body: capitaliza(cuerpo) + ".", source: "notas" };
}

/**
 * Genera el documento estructurado a partir de las notas del usuario.
 * Reparte las frases de las notas entre las secciones del agente; las
 * secciones que no reciben frase quedan marcadas como "estructura".
 */
export function generateStructured(
  agent: AgentConfig,
  notas: string,
  ctx: { obra: string; cliente: string; ubicacion: string },
): StructuredDoc {
  const frases = frasesDe(notas);

  const sections: DocSection[] = agent.secciones.map((heading, i) => {
    const frase = frases.length ? frases[i % frases.length] : undefined;
    // Solo asignamos frase real a las primeras secciones (una por frase);
    // el resto son estructura pura para que la procedencia sea honesta.
    const tieneNota = i < frases.length;
    const { body, source } = redactaSeccion(tieneNota ? frase : undefined, 0);
    return {
      id: `sec-${i}`,
      numero: i + 1,
      heading,
      body,
      source,
    };
  });

  const primera = frases[0] ?? agent.nombre.toLowerCase();
  const titulo = `${agent.nombre} — ${primera.slice(0, 48)}`;

  return {
    titulo,
    agentNombre: agent.nombre,
    meta: {
      obra: ctx.obra,
      cliente: ctx.cliente,
      ubicacion: ctx.ubicacion,
      fecha: formatDate(new Date().toISOString()),
    },
    sections,
  };
}

/**
 * Regenera UNA sola sección con una redacción distinta, conservando el resto
 * del documento intacto. (En producción: nueva llamada al modelo acotada a esa
 * sección, con el mismo contexto de notas.)
 */
export function regenerateSection(
  agent: AgentConfig,
  notas: string,
  doc: StructuredDoc,
  sectionId: string,
  variante: number,
): StructuredDoc {
  const frases = frasesDe(notas);
  return {
    ...doc,
    sections: doc.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const idx = doc.sections.findIndex((s) => s.id === sectionId);
      const tieneNota = idx < frases.length && frases.length > 0;
      // Rotamos la frase asignada para que el texto cambie de verdad.
      const frase = tieneNota
        ? frases[(idx + variante) % frases.length]
        : undefined;
      const { body, source } = redactaSeccion(frase, variante + 1);
      return { ...sec, body, source };
    }),
  };
}

/** Serializa el documento estructurado a Markdown (copiar / descargar / guardar). */
export function docToMarkdown(doc: StructuredDoc): string {
  const lines: string[] = [];
  lines.push(`# ${doc.agentNombre}`);
  lines.push("");
  lines.push(`**Obra:** ${doc.meta.obra}`);
  lines.push(`**Cliente:** ${doc.meta.cliente}`);
  lines.push(`**Ubicación:** ${doc.meta.ubicacion}`);
  lines.push(`**Fecha:** ${doc.meta.fecha}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  doc.sections.forEach((sec) => {
    lines.push(`## ${sec.numero}. ${sec.heading}`);
    lines.push(sec.source === "estructura" ? `_${sec.body}_` : sec.body);
    lines.push("");
  });
  lines.push("---");
  lines.push("");
  lines.push("## Firmas");
  lines.push("");
  lines.push("| Elaboró | Revisó | Autorizó |");
  lines.push("| --- | --- | --- |");
  lines.push("| &nbsp; | &nbsp; | &nbsp; |");
  lines.push("");
  lines.push(
    `_Documento generado por mnnsor a partir de notas de campo. Revisa antes de firmar._`,
  );
  return lines.join("\n");
}

/** Texto plano continuo de las secciones — base del streaming simulado. */
export function docToStreamText(doc: StructuredDoc): string {
  return doc.sections
    .map((s) => `${s.numero}. ${s.heading}\n${s.body}`)
    .join("\n\n");
}

/**
 * Parseo mínimo de un Markdown de mnnsor de vuelta a estructura, para poder
 * mostrar en vista papel los documentos ya guardados (que persisten como
 * Markdown). La procedencia se infiere: los cuerpos en _cursiva_ completa son
 * estructura; el resto, notas.
 */
export function markdownToStructured(
  markdown: string,
  agentNombre: string,
): StructuredDoc {
  const lines = markdown.split("\n");
  const meta: DocMeta = { obra: "—", cliente: "—", ubicacion: "—", fecha: "" };
  const sections: DocSection[] = [];
  let titulo = agentNombre;

  const metaMap: Record<string, keyof DocMeta> = {
    Obra: "obra",
    Cliente: "cliente",
    Ubicación: "ubicacion",
    Fecha: "fecha",
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const metaMatch = line.match(/^\*\*([^:]+):\*\*\s*(.*)$/);
    if (metaMatch && metaMap[metaMatch[1]]) {
      meta[metaMap[metaMatch[1]]] = metaMatch[2].trim();
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      const heading = line.slice(3).trim();
      if (/^firmas$/i.test(heading)) break; // el bloque de firmas se arma aparte
      const numMatch = heading.match(/^(\d+)\.\s*(.*)$/);
      const numero = numMatch ? Number(numMatch[1]) : sections.length + 1;
      const clean = numMatch ? numMatch[2] : heading;
      // Junta el cuerpo hasta el próximo encabezado / regla.
      const bodyLines: string[] = [];
      i++;
      while (
        i < lines.length &&
        !lines[i].startsWith("## ") &&
        lines[i].trim() !== "---"
      ) {
        if (lines[i].trim()) bodyLines.push(lines[i].trim());
        i++;
      }
      const raw = bodyLines.join(" ").trim();
      const esEstructura = /^_.*_$/.test(raw);
      const body = raw.replace(/^_|_$/g, "");
      sections.push({
        id: `sec-${sections.length}`,
        numero,
        heading: clean,
        body,
        source: esEstructura ? "estructura" : "notas",
      });
      continue;
    }
    i++;
  }

  if (sections.length) {
    titulo = `${agentNombre} — ${sections[0].body.slice(0, 48)}`;
  }

  return { titulo, agentNombre, meta, sections };
}

/**
 * Compat con el flujo previo: genera y devuelve `{ titulo, markdown }`.
 * @deprecated Preferir `generateStructured` para tener secciones + procedencia.
 */
export function generateDocument(
  agent: AgentConfig,
  notas: string,
  ctx: { obra: string; cliente: string; ubicacion: string },
): GeneratedDoc {
  const doc = generateStructured(agent, notas, ctx);
  return { titulo: doc.titulo, markdown: docToMarkdown(doc) };
}
