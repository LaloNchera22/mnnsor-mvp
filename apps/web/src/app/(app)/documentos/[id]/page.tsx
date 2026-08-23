"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { getAgent } from "@/lib/agents";
import {
  docToMarkdown,
  generateStructured,
  markdownToStructured,
  type StructuredDoc,
} from "@/lib/generate";
import { useStore } from "@/lib/store";
import { cn, formatDate } from "@/lib/utils";
import { PageHeader, Container } from "@/components/app/PageHeader";
import { PaperDocument } from "@/components/app/PaperDocument";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  IconCopy,
  IconDownload,
  IconPrinter,
  IconShield,
  IconSignature,
  IconTrash,
} from "@/components/ui/icons";

export default function DocumentoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { documents, obras, updateDocument, deleteDocument, ready } = useStore();
  const { success, info } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showProvenance, setShowProvenance] = useState(false);

  const doc = documents.find((d) => d.id === params.id);

  // Documento estructurado para la vista papel: primero desde `estructura`
  // (JSON guardado), luego reconstruido del Markdown o generado desde notas.
  const structured = useMemo<StructuredDoc | null>(() => {
    if (!doc) return null;
    const agent = getAgent(doc.docType);
    const agentNombre = agent?.nombre ?? doc.docType;
    if (doc.estructura) {
      try {
        return JSON.parse(doc.estructura) as StructuredDoc;
      } catch {
        /* cae al siguiente método */
      }
    }
    if (doc.contenido) return markdownToStructured(doc.contenido, agentNombre);
    const obra = obras.find((o) => o.id === doc.obraId);
    if (!agent) return null;
    return generateStructured(agent, doc.notasCrudas, {
      obra: obra?.nombre ?? "—",
      cliente: obra?.cliente ?? "—",
      ubicacion: obra?.ubicacion ?? "—",
    });
  }, [doc, obras]);

  if (!ready) {
    return (
      <Container className="py-16">
        <div className="skeleton h-64 w-full rounded-lg" />
      </Container>
    );
  }

  if (!doc || !structured) {
    notFound();
  }

  const agent = getAgent(doc.docType);
  const obra = obras.find((o) => o.id === doc.obraId);
  const markdown = doc.contenido || docToMarkdown(structured);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown);
      info("Copiado", "El documento está en el portapapeles.");
    } catch {
      info("No se pudo copiar", "Tu navegador bloqueó el portapapeles.");
    }
  }

  function handleDownload() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc!.folio}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Documentos", href: "/documentos" },
          { label: doc.folio },
        ]}
        eyebrow={`${agent?.slug} · ${doc.folio}`}
        title={doc.titulo}
        actions={
          <>
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
              title="Resalta qué salió de las notas y qué es estructura"
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
              leftIcon={<IconPrinter width={15} height={15} />}
              onClick={() => window.print()}
            >
              Imprimir / PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<IconDownload width={15} height={15} />}
              onClick={handleDownload}
            >
              Descargar
            </Button>
          </>
        }
      />

      <Container className="py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="min-w-0">
            {showProvenance && (
              <div className="mb-3 flex flex-wrap items-center gap-4 px-1 text-[0.75rem] text-ink-3 print:hidden">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-1 rounded-sm bg-ink" />
                  De las notas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-1 rounded-sm bg-line-strong" />
                  Estructura del formato
                </span>
              </div>
            )}
            <PaperDocument
              doc={structured}
              folio={doc.folio}
              showProvenance={showProvenance}
              photos={doc.fotos}
            />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start print:hidden">
            <Card>
              <CardHeader>
                <CardTitle>Detalle</CardTitle>
                <StatusBadge status={doc.status} />
              </CardHeader>
              <CardBody>
                <dl className="space-y-3 text-sm">
                  <Row label="Tipo" value={agent?.nombre ?? doc.docType} />
                  <Row label="Folio" value={<span className="font-mono">{doc.folio}</span>} />
                  <Row label="Obra" value={obra?.nombre ?? "—"} />
                  <Row label="Cliente" value={obra?.cliente ?? "—"} />
                  <Row label="Creado" value={formatDate(doc.createdAt)} />
                  <Row label="Actualizado" value={formatDate(doc.updatedAt)} />
                </dl>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-2">
                {doc.status !== "firmado" ? (
                  <Button
                    variant="primary"
                    className="w-full"
                    leftIcon={<IconSignature width={16} height={16} />}
                    onClick={() => {
                      updateDocument(doc.id, { status: "firmado" });
                      success("Marcado como firmado", `${doc.folio} quedó cerrado.`);
                    }}
                  >
                    Marcar como firmado
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      updateDocument(doc.id, { status: "generado" });
                      info("Reabierto", "El documento volvió a estado generado.");
                    }}
                  >
                    Reabrir documento
                  </Button>
                )}
                <Button
                  variant="danger"
                  className="w-full"
                  leftIcon={<IconTrash width={16} height={16} />}
                  onClick={() => setConfirmOpen(true)}
                >
                  Eliminar
                </Button>
              </CardBody>
            </Card>

            {doc.notasCrudas && (
              <div className="rounded-lg border border-dashed border-line-strong bg-surface-2/40 p-4">
                <p className="label-tec mb-1.5">Notas originales</p>
                <p className="text-[0.8125rem] leading-relaxed text-ink-3">
                  {doc.notasCrudas}
                </p>
              </div>
            )}
          </aside>
        </div>
      </Container>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Eliminar documento"
        description={`Se eliminará ${doc.folio}. Esta acción no se puede deshacer.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              leftIcon={<IconTrash width={16} height={16} />}
              onClick={() => {
                deleteDocument(doc.id);
                setConfirmOpen(false);
                success("Documento eliminado", `${doc.folio} se quitó de la biblioteca.`);
                router.push("/documentos");
              }}
            >
              Eliminar
            </Button>
          </>
        }
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="label-tec">{label}</dt>
      <dd className="min-w-0 truncate text-right text-ink-2">{value}</dd>
    </div>
  );
}
