"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { getAgent, isDocType } from "@/lib/agents";
import {
  docToMarkdown,
  generateStructured,
  regenerateSection,
  type Photo,
  type StructuredDoc,
} from "@/lib/generate";
import { PLAN_LABEL, useStore } from "@/lib/store";
import { createDocument } from "@/app/(app)/documentos/actions";
import { PageHeader, Container } from "@/components/app/PageHeader";
import { PaperDocument } from "@/components/app/PaperDocument";
import { PhotoCapture } from "@/components/app/PhotoCapture";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useDictation } from "@/lib/useDictation";
import { cn } from "@/lib/utils";
import {
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconCopy,
  IconDownload,
  IconEdit,
  IconMic,
  IconMicOff,
  IconPrinter,
  IconRefresh,
  IconShield,
  IconUpload,
} from "@/components/ui/icons";

type Phase = "capture" | "streaming" | "result";

// Velocidad del revelado por streaming (demo). En producción, el ritmo lo
// marca el stream de tokens de Claude vía SSE desde el servidor.
const STREAM_CHARS_PER_TICK = 12;
const STREAM_TICK_MS = 24;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function AgentePage() {
  const params = useParams<{ docType: string }>();
  const router = useRouter();
  const { success, info, warning } = useToast();
  const { currentObra, usedThisMonth, planLimit, org, ready } =
    useStore();

  const docType = params.docType;
  const agent = isDocType(docType) ? getAgent(docType) : undefined;
  const esReporteFoto = docType === "reporte_fotografico";

  const [notas, setNotas] = useState("");
  const [phase, setPhase] = useState<Phase>("capture");
  const [doc, setDoc] = useState<StructuredDoc | null>(null);
  const [streamChars, setStreamChars] = useState(0);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [variant, setVariant] = useState(1);
  const [showProvenance, setShowProvenance] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Dictado por voz: cada fragmento confirmado se añade a las notas.
  const appendDictation = useCallback((text: string) => {
    setNotas((prev) => (prev ? `${prev.replace(/\s+$/, "")} ${text}` : text));
  }, []);
  const dictado = useDictation(appendDictation);

  const unlimited = !isFinite(planLimit);
  const overLimit = !unlimited && usedThisMonth >= planLimit;
  const wordCount = notas.trim() ? notas.trim().split(/\s+/).length : 0;

  const breadcrumbs = useMemo(
    () => [{ label: "Inicio", href: "/" }, { label: agent?.nombre ?? "Agente" }],
    [agent?.nombre],
  );

  useEffect(() => {
    return () => {
      if (streamTimer.current) clearInterval(streamTimer.current);
    };
  }, []);

  if (!agent) {
    notFound();
  }

  // Para el reporte fotográfico, las descripciones de las fotos alimentan la
  // generación aunque el campo de notas esté vacío.
  function notasEfectivas(): string {
    if (esReporteFoto && photos.length) {
      const pies = photos
        .map((p, i) => (p.caption ? `foto ${i + 1}: ${p.caption}` : ""))
        .filter(Boolean)
        .join(", ");
      return [notas.trim(), pies].filter(Boolean).join(", ");
    }
    return notas;
  }

  const puedeGenerar =
    ready &&
    !overLimit &&
    (notas.trim().length >= 8 || (esReporteFoto && photos.length > 0));

  function startStreaming(structured: StructuredDoc) {
    const total = structured.sections.reduce((n, s) => n + s.body.length, 0);
    if (prefersReducedMotion()) {
      setStreamChars(total);
      setPhase("result");
      return;
    }
    setPhase("streaming");
    setStreamChars(0);
    if (streamTimer.current) clearInterval(streamTimer.current);
    streamTimer.current = setInterval(() => {
      setStreamChars((c) => {
        const next = c + STREAM_CHARS_PER_TICK;
        if (next >= total) {
          if (streamTimer.current) clearInterval(streamTimer.current);
          setPhase("result");
          return total;
        }
        return next;
      });
    }, STREAM_TICK_MS);
  }

  async function runGeneration() {
    if (!agent || !currentObra) return;
    if (dictado.listening) dictado.stop();

    setPhase("streaming");
    setStreamChars(0);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notasCrudas: notasEfectivas(),
          agentConfig: agent
        })
      });

      if (!res.ok) {
        throw new Error("Failed to generate document");
      }

      // Since it's an SSE stream from Anthropic, we need to parse SSE events
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      let fullText = "";
      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Keep the last partial line in the buffer
          buffer = lines.pop() || "";

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') continue;

              try {
                const data = JSON.parse(dataStr);
                if (data.type === 'content_block_delta' && data.delta && data.delta.text) {
                  fullText += data.delta.text;
                  setStreamChars(fullText.length);
                }
              } catch (e) {
                // Ignore partial JSON parsing errors
              }
            }
          }
        }
      }

      // The full text should be JSON string
      try {
        const parsed = JSON.parse(fullText);
        // Build the StructuredDoc compatible with UI
        const structured: StructuredDoc = {
          titulo: parsed.titulo || `Generado por ${agent.nombre}`,
          agentNombre: agent.nombre,
          meta: {
            obra: currentObra.nombre,
            cliente: currentObra.cliente || "—",
            ubicacion: currentObra.ubicacion || "—",
            fecha: new Date().toLocaleDateString("es-MX", { dateStyle: "long" }),
          },
          sections: parsed.secciones.map((sec: any) => ({
            id: `sec_${sec.numero}`,
            numero: sec.numero,
            heading: sec.heading,
            body: sec.body,
            source: sec.source || "notas",
          })),
        };

        setDoc(structured);
        setPhase("result");
        setVariant(1);
      } catch (err) {
        console.error("Failed to parse JSON stream", err);
        fallbackGeneration();
      }
    } catch (err) {
      console.error("API error", err);
      fallbackGeneration();
    }
  }

  function fallbackGeneration() {
    // Fallback a generación demo estructurada (Fase 1/2) si no hay API
    const structured = generateStructured(agent!, notasEfectivas(), {
      obra: currentObra!.nombre,
      cliente: currentObra!.cliente || "—",
      ubicacion: currentObra!.ubicacion || "—",
    });
    setDoc(structured);
    startStreaming(structured);
  }

  function handleEditSection(id: string, body: string) {
    setDoc((d) =>
      d
        ? {
            ...d,
            // Editado a mano: ahora es texto del usuario (procedencia "notas").
            sections: d.sections.map((s) =>
              s.id === id ? { ...s, body, source: "notas" } : s,
            ),
          }
        : d,
    );
  }

  function handleRegenerateSection(id: string) {
    if (!agent || !doc) return;
    setRegeneratingId(id);
    const v = variant + 1;
    setVariant(v);
    // Simula la latencia de una llamada acotada al modelo.
    window.setTimeout(() => {
      setDoc((d) => (d ? regenerateSection(agent, notasEfectivas(), d, id, v) : d));
      setRegeneratingId(null);
    }, 650);
  }

  async function handleSave() {
    if (!agent || !doc || !currentObra) return;
    const markdown = docToMarkdown(doc);

    try {
      const saved = await createDocument({
        doc_type: agent.docType,
        project_id: currentObra.id,
        notas_crudas: notasEfectivas(),
        contenido: markdown,
        titulo: doc.titulo,
        estructura: doc,
        fotos: esReporteFoto && photos.length ? photos : undefined,
      });
      success("Documento guardado", `${saved.folio || "S/N"} archivado en ${currentObra.nombre}.`);
      router.push(`/documentos`);
    } catch (err) {
      console.error(err);
      warning("Error", "No se pudo guardar el documento.");
    }
  }

  async function handleCopy() {
    if (!doc) return;
    try {
      await navigator.clipboard.writeText(docToMarkdown(doc));
      info("Copiado", "El documento está en el portapapeles.");
    } catch {
      info("No se pudo copiar", "Tu navegador bloqueó el portapapeles.");
    }
  }

  function handleDownload() {
    if (!doc) return;
    const blob = new Blob([docToMarkdown(doc)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agent!.slug}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        breadcrumbs={breadcrumbs}
        eyebrow={`${agent.slug} · ${agent.categoria}`}
        title={agent.nombre}
        description={agent.descripcion}
        actions={
          phase === "result" ? (
            <Button
              variant="secondary"
              leftIcon={<IconEdit width={16} height={16} />}
              onClick={() => setPhase("capture")}
            >
              Editar notas
            </Button>
          ) : undefined
        }
      />

      <Container className="py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="min-w-0">
            {phase === "capture" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notas de campo</CardTitle>
                  <span className="label-tec">
                    Obra · {currentObra?.nombre ?? "—"}
                  </span>
                </CardHeader>
                <CardBody className="space-y-4">
                  {overLimit && (
                    <div className="flex items-start gap-3 rounded-md border border-line-strong bg-surface-2 px-4 py-3">
                      <IconShield width={18} height={18} className="mt-0.5 shrink-0 text-ink" />
                      <p className="text-[0.8125rem] text-ink-2">
                        Alcanzaste el límite de {planLimit} documentos del plan{" "}
                        {PLAN_LABEL[org.plan]} este mes.{" "}
                        <a href="/ajustes#plan" className="font-medium text-ink underline">
                          Mejora tu plan
                        </a>{" "}
                        para seguir generando.
                      </p>
                    </div>
                  )}

                  <Field
                    label="Escribe como hablas en campo"
                    description={agent.pista}
                    hint={`${wordCount} palabras`}
                  >
                    {({ id, describedBy }) => (
                      <div className="relative">
                        <Textarea
                          id={id}
                          aria-describedby={describedBy}
                          value={notas}
                          onChange={(e) => setNotas(e.target.value)}
                          placeholder={agent.ejemplo}
                          className={cn(
                            "min-h-[220px] pr-14",
                            dictado.listening && "border-ink",
                          )}
                          disabled={overLimit}
                        />
                        {/* Botón de dictado por voz. */}
                        {dictado.supported && (
                          <button
                            type="button"
                            onClick={dictado.toggle}
                            disabled={overLimit}
                            aria-pressed={dictado.listening}
                            aria-label={
                              dictado.listening ? "Detener dictado" : "Dictar por voz"
                            }
                            title={
                              dictado.listening ? "Detener dictado" : "Dictar por voz"
                            }
                            className={cn(
                              "absolute right-2.5 top-2.5 inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors disabled:opacity-40",
                              dictado.listening
                                ? "border-ink bg-ink text-on-ink"
                                : "border-line-strong bg-surface text-ink-2 hover:border-ink/40 hover:text-ink",
                            )}
                          >
                            {dictado.listening ? (
                              <span className="relative flex items-center justify-center">
                                <IconMic width={18} height={18} />
                                <span className="absolute -inset-2 animate-ping rounded-full border border-on-ink/50" />
                              </span>
                            ) : (
                              <IconMic width={18} height={18} />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </Field>

                  {/* Estado del dictado. */}
                  {dictado.supported ? (
                    dictado.listening || dictado.interim ? (
                      <div
                        aria-live="polite"
                        className="flex items-start gap-2 rounded-md border border-line bg-surface-2/60 px-3 py-2 text-[0.8125rem]"
                      >
                        <span className="mt-0.5 flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-ink" />
                        <span className="text-ink-3">
                          {dictado.interim ? (
                            <>
                              <span className="text-muted">…</span> {dictado.interim}
                            </>
                          ) : (
                            "Escuchando… habla con normalidad; el texto se agrega a tus notas."
                          )}
                        </span>
                      </div>
                    ) : (
                      <p className="flex items-center gap-1.5 text-[0.75rem] text-ink-3">
                        <IconMic width={13} height={13} />
                        Toca el micrófono y dicta: “clima despejado, catorce
                        trabajadores…”. mnnsor escribe por ti.
                      </p>
                    )
                  ) : (
                    <p className="flex items-center gap-1.5 text-[0.75rem] text-muted">
                      <IconMicOff width={13} height={13} />
                      El dictado por voz no está disponible en este navegador.
                    </p>
                  )}
                  {dictado.error && (
                    <p className="text-[0.75rem] text-ink" role="alert">
                      {dictado.error}
                    </p>
                  )}

                  {/* Fotos del reporte fotográfico. */}
                  {esReporteFoto && (
                    <div className="rounded-md border border-line bg-surface-2/40 p-3">
                      <p className="label-tec mb-2">Fotos del reporte</p>
                      <PhotoCapture photos={photos} onChange={setPhotos} />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNotas(agent.ejemplo)}
                      disabled={overLimit}
                    >
                      Usar ejemplo
                    </Button>
                    {!esReporteFoto && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<IconUpload width={15} height={15} />}
                          onClick={() => fileRef.current?.click()}
                        >
                          Subir mi formato
                        </Button>
                        <input
                          ref={fileRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.xlsx,.jpg,.png"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              info(
                                "Formato recibido",
                                "La función estrella (llenar tu propio formato) llega en Fase 4.",
                              );
                              e.target.value = "";
                            }
                          }}
                        />
                      </>
                    )}
                    {notas && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-ink-3"
                        onClick={() => setNotas("")}
                      >
                        Limpiar
                      </Button>
                    )}
                  </div>
                </CardBody>
                <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[0.75rem] text-ink-3">
                    mnnsor redacta a partir de tus notas. No inventa datos que no diste.
                  </p>
                  <Button
                    variant="primary"
                    leftIcon={<IconBolt width={16} height={16} />}
                    onClick={runGeneration}
                    disabled={!puedeGenerar}
                  >
                    Generar documento
                  </Button>
                </div>
              </Card>
            )}

            {(phase === "streaming" || phase === "result") && doc && (
              <div className="space-y-3">
                {/* Barra de herramientas del documento. */}
                <div className="flex flex-col gap-3 rounded-md border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                  <div className="flex items-center gap-2 text-sm">
                    {phase === "streaming" ? (
                      <>
                        <span className="flex h-2 w-2 animate-pulse rounded-full bg-ink" />
                        <span className="font-medium text-ink">
                          Redactando en vivo…
                        </span>
                        <span className="text-ink-3">
                          a partir de tus notas de campo
                        </span>
                      </>
                    ) : (
                      <>
                        <IconCheck width={16} height={16} className="text-ink" />
                        <span className="font-medium text-ink">Documento generado</span>
                      </>
                    )}
                  </div>
                  {phase === "result" && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowProvenance((v) => !v)}
                        aria-pressed={showProvenance}
                        className={cn(
                          "inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-[0.8125rem] font-medium transition-colors",
                          showProvenance
                            ? "border-ink bg-ink text-on-ink"
                            : "border-line-strong bg-surface text-ink-2 hover:border-ink/40 hover:text-ink",
                        )}
                        title="Resalta qué salió de tus notas y qué es estructura"
                      >
                        <IconShield width={14} height={14} />
                        Procedencia
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<IconCopy width={15} height={15} />}
                        onClick={handleCopy}
                      >
                        Copiar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<IconDownload width={15} height={15} />}
                        onClick={handleDownload}
                      >
                        Descargar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<IconPrinter width={15} height={15} />}
                        onClick={() => window.print()}
                      >
                        Imprimir / PDF
                      </Button>
                    </div>
                  )}
                </div>

                {/* Leyenda de procedencia. */}
                {phase === "result" && showProvenance && (
                  <div className="flex flex-wrap items-center gap-4 px-1 text-[0.75rem] text-ink-3 print:hidden">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-3 w-1 rounded-sm bg-ink" />
                      De tus notas
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-3 w-1 rounded-sm bg-line-strong" />
                      Estructura del formato (sin dato inventado)
                    </span>
                  </div>
                )}

                <PaperDocument
                  doc={doc}
                  folio={`${agent.slug}-•••`}
                  editable={phase === "result"}
                  onEditSection={handleEditSection}
                  onRegenerateSection={handleRegenerateSection}
                  regeneratingId={regeneratingId}
                  showProvenance={phase === "result" && showProvenance}
                  streamChars={phase === "streaming" ? streamChars : undefined}
                  photos={esReporteFoto ? photos : undefined}
                />

                {phase === "result" && (
                  <div className="flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <Button
                      variant="ghost"
                      leftIcon={<IconRefresh width={16} height={16} />}
                      onClick={runGeneration}
                    >
                      Regenerar todo
                    </Button>
                    <Button
                      variant="primary"
                      rightIcon={<IconArrowRight width={16} height={16} />}
                      onClick={handleSave}
                    >
                      Guardar en la obra
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Panel lateral: qué produce este agente */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start print:hidden">
            <Card>
              <CardHeader>
                <CardTitle>Qué incluye</CardTitle>
                <span className="label-tec">{agent.secciones.length} secciones</span>
              </CardHeader>
              <CardBody>
                <ol className="space-y-2.5">
                  {agent.secciones.map((sec, i) => (
                    <li key={sec} className="flex items-start gap-3 text-[0.8125rem]">
                      <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded border border-line-strong font-mono text-[0.625rem] text-ink-3">
                        {i + 1}
                      </span>
                      <span className="text-ink-2">{sec}</span>
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>
            <div className="rounded-lg border border-dashed border-line-strong bg-surface-2/40 p-4">
              <p className="label-tec mb-1.5">Cómo se ve</p>
              <p className="text-[0.8125rem] leading-relaxed text-ink-3">
                Vista tal como se imprime y se firma: con membrete, obra y bloque
                de firmas. Puedes editar cada sección o regenerarla por separado
                antes de guardar.
              </p>
            </div>
            <ButtonLink href="/documentos" variant="ghost" size="sm" className="w-full">
              Ver documentos de esta obra
            </ButtonLink>
          </aside>
        </div>
      </Container>
    </>
  );
}
