"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { formatDate, cn } from "@/lib/utils";
import { PageHeader, Container } from "@/components/app/PageHeader";
import { NewObraModal } from "@/components/app/NewObraModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  IconArrowRight,
  IconCheck,
  IconObras,
  IconPlus,
} from "@/components/ui/icons";

export default function ObrasPage() {
  const { obras, documents, currentObra, setCurrentObra, ready } = useStore();
  const router = useRouter();
  const [newOpen, setNewOpen] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Portafolio"
        title="Obras"
        description="Cada obra agrupa su documentación y consumo. Selecciona una para trabajar en ella."
        actions={
          <Button
            variant="primary"
            leftIcon={<IconPlus width={16} height={16} />}
            onClick={() => setNewOpen(true)}
          >
            Nueva obra
          </Button>
        }
      />

      <Container className="py-8">
        {!ready ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : obras.length === 0 ? (
          <EmptyState
            icon={<IconObras width={24} height={24} />}
            title="Crea tu primera obra"
            description="Las obras organizan toda tu documentación por proyecto."
            action={
              <Button variant="primary" leftIcon={<IconPlus width={16} height={16} />} onClick={() => setNewOpen(true)}>
                Nueva obra
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {obras.map((obra) => {
              const count = documents.filter((d) => d.obraId === obra.id).length;
              const active = obra.id === currentObra?.id;
              return (
                <Card
                  key={obra.id}
                  className={cn(
                    "flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-md",
                    active && "border-ink ring-1 ring-ink",
                  )}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md border border-line-strong bg-surface-2 text-ink-2">
                      <IconObras width={20} height={20} />
                    </span>
                    {active && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 font-mono text-[0.625rem] font-medium uppercase tracking-wide text-on-ink">
                        <IconCheck width={11} height={11} /> Actual
                      </span>
                    )}
                  </div>
                  <h3 className="text-[0.95rem] font-semibold tracking-tight text-ink">
                    {obra.nombre}
                  </h3>
                  <p className="mt-0.5 text-[0.8125rem] text-ink-3">{obra.cliente}</p>
                  <dl className="mt-4 flex items-center gap-4 border-t border-line pt-3 font-mono text-[0.6875rem] text-ink-3">
                    <div>
                      <dt className="uppercase tracking-wide">Docs</dt>
                      <dd className="mt-0.5 text-base font-semibold text-ink">{count}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="uppercase tracking-wide">Ubicación</dt>
                      <dd className="mt-0.5 truncate text-[0.8125rem] font-normal text-ink-2">
                        {obra.ubicacion}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-[0.6875rem] text-muted">
                    Creada {formatDate(obra.createdAt)}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    {active ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        rightIcon={<IconArrowRight width={15} height={15} />}
                        onClick={() => router.push("/documentos")}
                      >
                        Ver documentos
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => setCurrentObra(obra.id)}
                      >
                        Trabajar en esta obra
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Container>

      <NewObraModal open={newOpen} onClose={() => setNewOpen(false)} />
    </>
  );
}
