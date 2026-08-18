"use client";

import { useMemo, useState } from "react";
import { AGENTS } from "@/lib/agents";
import { useStore, type DocStatus } from "@/lib/store";
import { PageHeader, Container } from "@/components/app/PageHeader";
import { DocumentRow } from "@/components/app/DocumentRow";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconDocs, IconPlus, IconSearch } from "@/components/ui/icons";

const STATUS: { value: DocStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos los estados" },
  { value: "borrador", label: "Borrador" },
  { value: "generado", label: "Generado" },
  { value: "firmado", label: "Firmado" },
];

export default function DocumentosPage() {
  const { documents, obras, currentObra, ready } = useStore();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<string>("todos");
  const [status, setStatus] = useState<string>("todos");
  const [scope, setScope] = useState<"obra" | "todas">("obra");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return documents
      .filter((d) => (scope === "obra" && currentObra ? d.obraId === currentObra.id : true))
      .filter((d) => (tipo === "todos" ? true : d.docType === tipo))
      .filter((d) => (status === "todos" ? true : d.status === status))
      .filter((d) =>
        query ? `${d.titulo} ${d.folio} ${d.notasCrudas}`.toLowerCase().includes(query) : true,
      )
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [documents, q, tipo, status, scope, currentObra]);

  return (
    <>
      <PageHeader
        eyebrow="Biblioteca"
        title="Documentos"
        description="Todo lo que has generado, archivado por obra y listo para exportar o firmar."
        actions={
          <ButtonLink
            href="/agentes/bitacora"
            variant="primary"
            leftIcon={<IconPlus width={16} height={16} />}
          >
            Nuevo documento
          </ButtonLink>
        }
      />

      <Container className="py-8">
        {/* Filtros */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <IconSearch
              width={16}
              height={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por título, folio o contenido…"
              className="pl-9"
              aria-label="Buscar documentos"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex">
            <Select
              value={scope}
              onChange={(e) => setScope(e.target.value as "obra" | "todas")}
              aria-label="Alcance"
              className="lg:w-44"
            >
              <option value="obra">Obra actual</option>
              <option value="todas">Todas las obras</option>
            </Select>
            <Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              aria-label="Tipo de documento"
              className="lg:w-48"
            >
              <option value="todos">Todos los tipos</option>
              {AGENTS.map((a) => (
                <option key={a.docType} value={a.docType}>
                  {a.nombre}
                </option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Estado"
              className="col-span-2 sm:col-span-1 lg:w-44"
            >
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {!ready ? (
          <Card className="divide-y divide-line">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-9 w-11" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="mt-2 h-3 w-1/3" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </Card>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<IconDocs width={24} height={24} />}
            title={documents.length === 0 ? "Aún no hay documentos" : "Sin resultados"}
            description={
              documents.length === 0
                ? "Genera tu primer documento desde cualquier agente."
                : "Prueba con otros filtros o cambia el alcance a todas las obras."
            }
            action={
              documents.length === 0 ? (
                <ButtonLink href="/agentes/bitacora" variant="primary" leftIcon={<IconPlus width={16} height={16} />}>
                  Nuevo documento
                </ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="mb-3 label-tec">
              {filtered.length} {filtered.length === 1 ? "documento" : "documentos"}
            </p>
            <Card className="divide-y divide-line overflow-hidden">
              {filtered.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  obraNombre={obras.find((o) => o.id === doc.obraId)?.nombre}
                />
              ))}
            </Card>
          </>
        )}
      </Container>
    </>
  );
}
