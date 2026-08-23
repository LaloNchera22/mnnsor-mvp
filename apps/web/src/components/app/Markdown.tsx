import { Fragment, type ReactNode } from "react";

/*
 * Renderizador de Markdown mínimo y seguro (sin HTML crudo) para el
 * documento generado: encabezados, párrafos, regla, tablas, listas, negritas
 * e itálicas. Suficiente para el formato que produce el generador; en
 * producción se reemplazaría por el render del documento final.
 */

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <em key={`${keyPrefix}-i-${i}`} className="text-ink-3">
          {token.slice(1, -1)}
        </em>,
      );
    }
    last = m.index + token.length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={key++} className="text-xl font-semibold tracking-tight text-ink">
          {inline(line.slice(2), `h1-${key}`)}
        </h1>,
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h2
          key={key++}
          className="mt-6 border-b border-line pb-1.5 font-mono text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-ink-2"
        >
          {inline(line.slice(3), `h2-${key}`)}
        </h2>,
      );
      i++;
      continue;
    }
    if (line.trim() === "---") {
      blocks.push(<hr key={key++} className="my-5 border-line" />);
      i++;
      continue;
    }
    // Tabla
    if (line.trim().startsWith("|")) {
      const table: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        table.push(lines[i]);
        i++;
      }
      const rows = table
        .filter((r) => !/^\s*\|[\s:|-]+\|\s*$/.test(r))
        .map((r) =>
          r
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((c) => c.trim()),
        );
      const [head, ...body] = rows;
      blocks.push(
        <div key={key++} className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {head && (
              <thead>
                <tr>
                  {head.map((c, ci) => (
                    <th
                      key={ci}
                      className="border border-line bg-surface-2 px-3 py-2 text-left font-mono text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-3"
                    >
                      {inline(c, `th-${ci}`)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci} className="border border-line px-3 py-2.5 text-ink-2">
                      {c === "&nbsp;" ? " " : inline(c, `td-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    // Lista
    if (/^\s*[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-3 list-disc space-y-1 pl-5 text-sm text-ink-2">
          {items.map((it, ii) => (
            <li key={ii}>{inline(it, `li-${ii}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    // Párrafo
    blocks.push(
      <p key={key++} className="text-sm leading-relaxed text-ink-2">
        {inline(line, `p-${key}`)}
      </p>,
    );
    i++;
  }

  return <div className="space-y-2.5">{blocks.map((b, idx) => <Fragment key={idx}>{b}</Fragment>)}</div>;
}
