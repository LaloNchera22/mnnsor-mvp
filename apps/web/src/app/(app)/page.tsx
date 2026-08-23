"use client";

import Link from "next/link";
import { AGENTS } from "@/lib/agents";
import { PLAN_LABEL, useStore } from "@/lib/store";
import { Container } from "@/components/app/PageHeader";
import { AgentCard } from "@/components/app/AgentCard";
import { DocumentRow } from "@/components/app/DocumentRow";
import { OnboardingGuide } from "@/components/app/OnboardingGuide";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Progress } from "@/components/ui/Progress";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  IconArrowRight,
  IconCheckCircle,
  IconDocs,
  IconObras,
} from "@/components/ui/icons";

function StatCard({
  label,
  value,
  sub,
  icon,
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <span className="label-tec">{label}</span>
        <span className="text-ink-3">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink tabular-nums">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[0.8125rem] text-ink-3">{sub}</p>}
      {children}
    </Card>
  );
}

export default function DashboardPage() {
  const {
    ready,
    onboarded,
    org,
    obras,
    documents,
    currentObra,
    usedThisMonth,
    planLimit,
  } = useStore();

  // Primer uso: onboarding guiado en vez del dashboard con datos de ejemplo.
  if (ready && !onboarded) {
    return <OnboardingGuide />;
  }

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buen día" : hora < 19 ? "Buenas tardes" : "Buenas noches";
  const firmados = documents.filter((d) => d.status === "firmado").length;
  const unlimited = !isFinite(planLimit);
  const recientes = [...documents]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 6);

  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container className="py-8">
          <p className="label-tec mb-1.5">
            {saludo} · {currentObra?.nombre ?? "Sin obra seleccionada"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.9rem]">
            Notas de campo → documento formal, listo para firmar
          </h1>
          <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-3">
            Escribe tus notas crudas o sube tu propio formato; mnnsor te devuelve el
            documento en el formato que entregas. Elige un agente para empezar.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <ButtonLink
              href="/agentes/bitacora"
              variant="primary"
              rightIcon={<IconArrowRight width={16} height={16} />}
            >
              Nueva bitácora
            </ButtonLink>
            <ButtonLink href="/documentos" variant="secondary">
              Ver documentos
            </ButtonLink>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {!ready ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[104px]" />
            ))
          ) : (
            <>
              <StatCard
                label="Documentos / mes"
                value={String(usedThisMonth)}
                sub={unlimited ? "Uso ilimitado" : `de ${planLimit} en plan ${PLAN_LABEL[org.plan]}`}
                icon={<IconDocs width={18} height={18} />}
              >
                {!unlimited && (
                  <Progress value={usedThisMonth} max={planLimit} className="mt-3" />
                )}
              </StatCard>
              <StatCard
                label="Documentos totales"
                value={String(documents.length)}
                sub="En todas las obras"
                icon={<IconDocs width={18} height={18} />}
              />
              <StatCard
                label="Firmados"
                value={String(firmados)}
                sub="Cerrados y entregados"
                icon={<IconCheckCircle width={18} height={18} />}
              />
              <StatCard
                label="Obras activas"
                value={String(obras.length)}
                sub="Con documentación"
                icon={<IconObras width={18} height={18} />}
              />
            </>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem]">
          {/* Agentes */}
          <section aria-labelledby="agentes-titulo">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id="agentes-titulo" className="text-base font-semibold tracking-tight text-ink">
                Agentes
              </h2>
              <span className="label-tec">{AGENTS.length} documentos</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {AGENTS.map((agent) => (
                <AgentCard key={agent.docType} agent={agent} />
              ))}
            </div>
          </section>

          {/* Actividad reciente */}
          <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="actividad-titulo">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id="actividad-titulo" className="text-base font-semibold tracking-tight text-ink">
                Actividad reciente
              </h2>
              <Link href="/documentos" className="text-[0.8125rem] font-medium text-ink-3 hover:text-ink">
                Ver todo
              </Link>
            </div>
            {!ready ? (
              <Card className="divide-y divide-line">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="mt-2 h-3 w-1/2" />
                  </div>
                ))}
              </Card>
            ) : recientes.length === 0 ? (
              <EmptyState
                compact
                icon={<IconDocs width={22} height={22} />}
                title="Aún no hay documentos"
                description="Cuando generes tu primer documento aparecerá aquí, archivado por obra."
              />
            ) : (
              <Card className="divide-y divide-line overflow-hidden">
                {recientes.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    obraNombre={obras.find((o) => o.id === doc.obraId)?.nombre}
                  />
                ))}
              </Card>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}
