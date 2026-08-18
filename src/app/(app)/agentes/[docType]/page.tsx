"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { getAgent, isDocType } from "@/lib/agents";
import { generateDocument, type GeneratedDoc } from "@/lib/generate";
import { PLAN_LABEL, useStore } from "@/lib/store";
import { PageHeader, Container } from "@/components/app/PageHeader";
import { Markdown } from "@/components/app/Markdown";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import {
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconCopy,
  IconDownload,
  IconEdit,
  IconShield,
  IconUpload,
} from "@/components/ui/icons";

type Phase = "capture" | "generating" | "result";

const STEPS = [
  "Leyendo notas de campo",
  "Estructurando por secciones",
  "Redactando en formato formal",
  "Preparando bloque de firmas",
];

export default function AgentePage() {
  const params = useParams<{ docType: string }>();
  const router = useRouter();
  const { success, info } = useToast();
  const {
    currentObra,
    createDocument,
    usedThisMonth,
    planLimit,
    org,
    ready,
  } = useStore();

  const docType = params.docType;
  const agent = isDocType(docType) ? getAgent(docType) : undefined;

  const [notas, setNotas] = useState("");
  const [phase, setPhase] = useState<Phase>("capture");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<GeneratedDoc | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const unlimited = !isFinite(planLimit);
  const overLimit = !unlimited && usedThisMonth >= planLimit;
  const wordCount = notas.trim() ? notas.trim().split(/\s+/).length : 0;

  const breadcrumbs = useMemo(
    () => [{ label: "Inicio", href: "/" }, { label: agent?.nombre ?? "Agente" }],
    [agent?.nombre],
  );

  if (!agent) {
    notFound();
  }

  function runGeneration() {
    if (!agent || !currentObra) return;
    setPhase("generating");
    setStep(0);
    // Animación de pasos (demo). En producción es streaming del modelo.
    let s = 0;
    const timer = setInterval(() => {
      s += 1;
      if (s < STEPS.length) {
        setStep(s);
      } else {
        clearInterval(timer);
        const doc = generateDocument(agent, notas, {
          obra: currentObra.nombre,
          cliente: currentObra.cliente,
          ubicacion: currentObra.ubicacion,
        });
        setResult(doc);
        setPhase("result");
      }
    }, 620);
  }

  function handleSave() {
    if (!agent || !result || !currentObra) return;
    const doc = createDocument({
      docType: agent.docType,
      obraId: currentObra.id,
      notasCrudas: notas,
      contenido: result.markdown,
      titulo: result.titulo,
    });
    success("Documento guardado", `${doc.folio} archivado en ${currentObra.nombre}.`);
    router.push(`/documentos/${doc.id}`);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      info("Copiado", "El documento está en el portapapeles.");
    } catch {
      info("No se pudo copiar", "Tu navegador bloqueó el portapapeles.");
    }
  }

  function handleDownload() {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: "text/markdown;charset=utf-8" });
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
                      <Textarea
                        id={id}
                        aria-describedby={describedBy}
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        placeholder={agent.ejemplo}
                        className="min-h-[220px]"
                        disabled={overLimit}
                      />
                    )}
                  </Field>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNotas(agent.ejemplo)}
                      disabled={overLimit}
                    >
                      Usar ejemplo
                    </Button>
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
                    disabled={notas.trim().length < 8 || overLimit || !ready}
                  >
                    Generar documento
                  </Button>
                </div>
              </Card>
            )}

            {phase === "generating" && (
              <Card>
                <CardBody className="py-10">
                  <div className="mx-auto max-w-sm">
                    <div className="mb-6 flex items-center justify-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-ink bg-ink text-on-ink">
                        <IconBolt width={22} height={22} />
                      </span>
                    </div>
                    <p className="text-center text-sm font-medium text-ink">
                      Generando {agent.nombre.toLowerCase()}…
                    </p>
                    <ul className="mt-6 space-y-3">
                      {STEPS.map((label, i) => {
                        const done = i < step;
                        const activeStep = i === step;
                        return (
                          <li key={label} className="flex items-center gap-3 text-sm">
                            <span
                              className={
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border " +
                                (done
                                  ? "border-ink bg-ink text-on-ink"
                                  : activeStep
                                    ? "border-ink text-ink"
                                    : "border-line text-muted")
                              }
                            >
                              {done ? (
                                <IconCheck width={13} height={13} />
                              ) : activeStep ? (
                                <span className="h-2 w-2 animate-caret-blink rounded-full bg-ink" />
                              ) : (
                                <span className="font-mono text-[0.625rem]">{i + 1}</span>
                              )}
                            </span>
                            <span className={done || activeStep ? "text-ink" : "text-muted"}>
                              {label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </CardBody>
              </Card>
            )}

            {phase === "result" && result && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <IconCheck width={16} height={16} className="text-ink" />
                    <CardTitle>Documento generado</CardTitle>
                  </div>
                  <div className="flex items-center gap-1.5">
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
                  </div>
                </CardHeader>
                <CardBody>
                  <article className="rounded-md border border-line bg-surface-2/40 p-5 sm:p-6">
                    <Markdown source={result.markdown} />
                  </article>
                </CardBody>
                <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="ghost" onClick={runGeneration}>
                    Regenerar
                  </Button>
                  <Button
                    variant="primary"
                    rightIcon={<IconArrowRight width={16} height={16} />}
                    onClick={handleSave}
                  >
                    Guardar en la obra
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Panel lateral: qué produce este agente */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
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
              <p className="label-tec mb-1.5">Buenas prácticas</p>
              <p className="text-[0.8125rem] leading-relaxed text-ink-3">
                Revisa siempre el documento antes de firmar. mnnsor estructura y
                redacta, pero la responsabilidad técnica es de quien firma.
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
