"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { DocSection, Photo, StructuredDoc } from "@/lib/generate";
import { IconEdit, IconRefresh } from "@/components/ui/icons";

/*
 * Vista previa tipo papel/PDF del documento.
 *
 * El documento se firma: se muestra tal como se verá impreso —hoja paginada,
 * con membrete (marca + obra + folio) y bloque de firmas— en vez de Markdown
 * crudo. Genera confianza y coherencia de marca.
 *
 * Además soporta, sobre la misma hoja:
 *  - edición inline de cada sección (`editable`),
 *  - regenerar una sola sección (`onRegenerateSection`),
 *  - marcar la procedencia notas vs. estructura (`showProvenance`),
 *  - revelado por streaming (`streamChars`) para el "texto en vivo".
 */

interface PaperDocumentProps {
  doc: StructuredDoc;
  folio?: string;
  editable?: boolean;
  onEditSection?: (id: string, body: string) => void;
  onRegenerateSection?: (id: string) => void;
  regeneratingId?: string | null;
  showProvenance?: boolean;
  /** Caracteres acumulados a revelar en los cuerpos (streaming). Sin valor = todo. */
  streamChars?: number;
  photos?: Photo[];
}

/** Suma de longitudes de los cuerpos hasta cada sección (para el streaming). */
function bodyOffsets(sections: DocSection[]): number[] {
  const offs: number[] = [];
  let acc = 0;
  for (const s of sections) {
    offs.push(acc);
    acc += s.body.length;
  }
  return offs;
}

export function PaperDocument({
  doc,
  folio,
  editable = false,
  onEditSection,
  onRegenerateSection,
  regeneratingId = null,
  showProvenance = false,
  streamChars,
  photos,
}: PaperDocumentProps) {
  // La hoja es siempre papel claro (se verá igual impresa), así que el
  // wordmark va en negro independientemente del tema de la app.
  const wordmark = "/brand/wordmark-black.png";

  const streaming = typeof streamChars === "number";
  const offsets = bodyOffsets(doc.sections);
  const totalBody = offsets.length
    ? offsets[offsets.length - 1] + doc.sections[doc.sections.length - 1].body.length
    : 0;
  const revealed = streaming ? Math.min(streamChars!, totalBody) : totalBody;

  return (
    <div className="paper-sheet mx-auto w-full max-w-[46rem] rounded-sm border border-line-strong bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_-12px_rgba(0,0,0,0.25)] dark:bg-neutral-50">
      <div className="px-8 py-9 sm:px-12 sm:py-12">
        {/* Membrete */}
        <header className="flex flex-col gap-4 border-b-2 border-neutral-900 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Image
              src={wordmark}
              alt="mnnsor"
              width={132}
              height={30}
              className="h-6 w-auto"
              priority
            />
            <p className="mt-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {doc.agentNombre}
            </p>
            <h1 className="mt-1 text-lg font-semibold leading-tight tracking-tight text-neutral-900">
              {doc.titulo}
            </h1>
          </div>
          {folio && (
            <div className="shrink-0 text-left sm:text-right">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-neutral-400">
                Folio
              </p>
              <p className="font-mono text-sm font-semibold text-neutral-900">
                {folio}
              </p>
            </div>
          )}
        </header>

        {/* Metadatos de obra */}
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 border-b border-neutral-200 py-5 sm:grid-cols-4">
          <MetaCell label="Obra" value={doc.meta.obra} />
          <MetaCell label="Cliente" value={doc.meta.cliente} />
          <MetaCell label="Ubicación" value={doc.meta.ubicacion} />
          <MetaCell label="Fecha" value={doc.meta.fecha} />
        </dl>

        {/* Cuerpo por secciones */}
        <div className="mt-6 space-y-6">
          {doc.sections.map((sec, i) => {
            const start = offsets[i];
            const end = start + sec.body.length;
            // Streaming: oculta secciones aún no alcanzadas.
            if (streaming && revealed <= start && sec.body.length > 0) return null;
            const visibleBody =
              streaming && revealed < end
                ? sec.body.slice(0, revealed - start)
                : sec.body;
            const isWriting = streaming && revealed > start && revealed < end;
            return (
              <SectionBlock
                key={sec.id}
                section={sec}
                visibleBody={visibleBody}
                writing={isWriting}
                editable={editable && !streaming}
                onEdit={onEditSection}
                onRegenerate={onRegenerateSection}
                regenerating={regeneratingId === sec.id}
                showProvenance={showProvenance}
              />
            );
          })}
        </div>

        {/* Fotos (reporte fotográfico) */}
        {photos && photos.length > 0 && !streaming && (
          <section className="mt-8">
            <SectionHeading numero={doc.sections.length + 1} heading="Anexo fotográfico" />
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {photos.map((ph, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <figure key={ph.id} className="overflow-hidden rounded-sm border border-neutral-300">
                  <img
                    src={ph.dataUrl}
                    alt={ph.caption || `Foto ${idx + 1}`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="border-t border-neutral-200 px-2 py-1.5 text-[0.7rem] text-neutral-600">
                    <span className="font-mono text-neutral-400">
                      {String(idx + 1).padStart(2, "0")}
                    </span>{" "}
                    {ph.caption || "Sin descripción"}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Bloque de firmas */}
        {!streaming && (
          <section className="mt-10 border-t border-neutral-200 pt-6">
            <p className="mb-6 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Firmas
            </p>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {["Elaboró", "Revisó", "Autorizó"].map((rol) => (
                <div key={rol} className="text-center">
                  <div className="h-12" />
                  <div className="border-t border-neutral-400" />
                  <p className="mt-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500">
                    {rol}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[0.68rem] leading-relaxed text-neutral-400">
              Documento generado por mnnsor a partir de notas de campo. Revísalo
              antes de firmar; la responsabilidad técnica es de quien firma.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-[0.8125rem] font-medium text-neutral-800">
        {value || "—"}
      </dd>
    </div>
  );
}

function SectionHeading({ numero, heading }: { numero: number; heading: string }) {
  return (
    <h2 className="flex items-baseline gap-2 border-b border-neutral-200 pb-1.5">
      <span className="font-mono text-[0.7rem] font-semibold text-neutral-400">
        {String(numero).padStart(2, "0")}
      </span>
      <span className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-neutral-600">
        {heading}
      </span>
    </h2>
  );
}

function SectionBlock({
  section,
  visibleBody,
  writing,
  editable,
  onEdit,
  onRegenerate,
  regenerating,
  showProvenance,
}: {
  section: DocSection;
  visibleBody: string;
  writing: boolean;
  editable: boolean;
  onEdit?: (id: string, body: string) => void;
  onRegenerate?: (id: string) => void;
  regenerating: boolean;
  showProvenance: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(section.body);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(section.body);
  }, [section.body, editing]);

  useEffect(() => {
    if (editing && taRef.current) {
      const el = taRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    if (draft.trim() && draft !== section.body) onEdit?.(section.id, draft.trim());
    else setDraft(section.body);
  }

  const esNotas = section.source === "notas";
  const bodyTone = esNotas ? "text-neutral-800" : "text-neutral-400 italic";
  // Marca de procedencia, en monocromo estricto: lo que salió de las notas
  // lleva una barra sólida a la izquierda; la estructura, una barra punteada.
  const provClass =
    showProvenance && !writing
      ? esNotas
        ? "rounded-sm bg-neutral-100 [box-shadow:inset_3px_0_0_theme(colors.neutral.900)] pl-3 pr-2"
        : "rounded-sm [box-shadow:inset_3px_0_0_theme(colors.neutral.300)] pl-3 pr-2"
      : "";

  return (
    <section className="group/sec">
      <div className="flex items-center justify-between gap-2">
        <SectionHeading numero={section.numero} heading={section.heading} />
        {editable && !editing && (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/sec:opacity-100 focus-within:opacity-100 print:hidden">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[0.7rem] font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              title="Editar esta sección"
            >
              <IconEdit width={13} height={13} />
              Editar
            </button>
            {onRegenerate && (
              <button
                type="button"
                onClick={() => onRegenerate(section.id)}
                disabled={regenerating}
                className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[0.7rem] font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
                title="Regenerar solo esta sección"
              >
                <IconRefresh
                  width={13}
                  height={13}
                  className={regenerating ? "animate-spin" : undefined}
                />
                {regenerating ? "Regenerando…" : "Regenerar"}
              </button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-2 print:hidden">
          <textarea
            ref={taRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
              if (e.key === "Escape") {
                setDraft(section.body);
                setEditing(false);
              }
            }}
            className="w-full resize-none rounded-sm border border-neutral-900 bg-white px-3 py-2 text-[0.9rem] leading-relaxed text-neutral-900 outline-none ring-2 ring-neutral-900/10"
          />
          <p className="mt-1 text-[0.65rem] text-neutral-400">
            ⌘/Ctrl + Enter para guardar · Esc para cancelar
          </p>
        </div>
      ) : (
        <p className={`mt-2 text-[0.9rem] leading-relaxed ${bodyTone} ${provClass} py-1`}>
          {visibleBody}
          {writing && (
            <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-caret-blink bg-neutral-900 align-baseline" />
          )}
        </p>
      )}
    </section>
  );
}
