import type { AgentConfig } from "@/lib/agents";
import { formatDate } from "@/lib/utils";

/*
 * Generador de demostración.
 *
 * En producción esto es una llamada a la Anthropic API desde el servidor
 * (Server Action / route handler) que transforma las notas crudas en el
 * documento formal siguiendo el schema del agente. Aquí armamos un borrador
 * verosímil a partir de las secciones del agente para poder ejercitar toda la
 * UI/UX del flujo (captura → generación → revisión → exportación) sin backend.
 */

export interface GeneratedDoc {
  titulo: string;
  markdown: string;
}

/** Reparte frases de las notas entre las secciones del documento. */
export function generateDocument(
  agent: AgentConfig,
  notas: string,
  ctx: { obra: string; cliente: string; ubicacion: string },
): GeneratedDoc {
  const frases = notas
    .split(/[.,;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  const lines: string[] = [];
  lines.push(`# ${agent.nombre}`);
  lines.push("");
  lines.push(`**Obra:** ${ctx.obra}`);
  lines.push(`**Cliente:** ${ctx.cliente}`);
  lines.push(`**Ubicación:** ${ctx.ubicacion}`);
  lines.push(`**Fecha:** ${formatDate(new Date().toISOString())}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  agent.secciones.forEach((sec, i) => {
    lines.push(`## ${i + 1}. ${sec}`);
    const trozo = frases[i % Math.max(frases.length, 1)];
    if (trozo) {
      const texto = trozo.charAt(0).toUpperCase() + trozo.slice(1);
      lines.push(texto + ".");
    } else {
      lines.push("_Sin información capturada para esta sección._");
    }
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

  const primera = frases[0] ?? agent.nombre.toLowerCase();
  const titulo = `${agent.nombre} — ${primera.slice(0, 48)}`;

  return { titulo, markdown: lines.join("\n") };
}
