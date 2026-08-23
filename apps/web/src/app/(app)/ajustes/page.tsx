"use client";

import { useState } from "react";
import {
  PLAN_LABEL,
  PLAN_LIMITS,
  useStore,
  type PlanId,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import { PageHeader, Container } from "@/components/app/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Progress } from "@/components/ui/Progress";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { IconCheck } from "@/components/ui/icons";

const PLANS: { id: PlanId; precio: string; desc: string; features: string[] }[] = [
  {
    id: "free",
    precio: "$0",
    desc: "Para probar mnnsor en una obra.",
    features: ["15 documentos / mes", "Los 7 agentes", "1 usuario"],
  },
  {
    id: "pro",
    precio: "$490",
    desc: "Para el residente que documenta a diario.",
    features: ["300 documentos / mes", "Sube tu propio formato", "Historial por obra", "Soporte prioritario"],
  },
  {
    id: "empresa",
    precio: "A medida",
    desc: "Para la constructora con varias obras.",
    features: ["Documentos ilimitados", "Usuarios y roles", "Plantillas de la empresa", "Facturación consolidada"],
  },
];

function Section({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="grid grid-cols-1 gap-4 border-b border-line py-8 first:pt-0 last:border-0 lg:grid-cols-[16rem_1fr]">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
        {description && <p className="mt-1 text-[0.8125rem] text-ink-3">{description}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

export default function AjustesPage() {
  const { org, setOrgName, setPlan, usedThisMonth, planLimit, reset } = useStore();
  const { success, info } = useToast();
  const [name, setName] = useState(org.nombre);
  const [resetOpen, setResetOpen] = useState(false);

  const unlimited = !isFinite(planLimit);

  return (
    <>
      <PageHeader
        eyebrow="Configuración"
        title="Ajustes"
        description="Organización, apariencia, plan y datos de tu cuenta mnnsor."
      />

      <Container className="py-2">
        <Section id="perfil" title="Organización" description="El nombre aparece en tus documentos y en la marca de la cuenta.">
          <Card>
            <CardBody className="space-y-4">
              <Field label="Nombre de la organización">
                {({ id }) => (
                  <Input id={id} value={name} onChange={(e) => setName(e.target.value)} className="max-w-md" />
                )}
              </Field>
              <Field label="Correo" description="Se conecta a la sesión de Supabase en Fase 2.">
                {({ id }) => (
                  <Input id={id} value="liebano.pacheco.eduardo@gmail.com" disabled className="max-w-md" />
                )}
              </Field>
              <div>
                <Button
                  variant="primary"
                  onClick={() => {
                    setOrgName(name.trim() || org.nombre);
                    success("Guardado", "Se actualizó el nombre de la organización.");
                  }}
                  disabled={name.trim() === org.nombre || name.trim().length < 2}
                >
                  Guardar cambios
                </Button>
              </div>
            </CardBody>
          </Card>
        </Section>

        <Section title="Apariencia" description="Elige el tema. Todo mnnsor es monocromo, en claro u oscuro.">
          <Card>
            <CardBody className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">Tema de la interfaz</p>
                <p className="mt-0.5 text-[0.8125rem] text-ink-3">
                  “Sistema” sigue la preferencia de tu dispositivo.
                </p>
              </div>
              <ThemeToggle />
            </CardBody>
          </Card>
        </Section>

        <Section id="plan" title="Plan y consumo" description="Cambia de plan cuando lo necesites. El consumo se reinicia cada mes.">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Consumo de {PLAN_LABEL[org.plan]}</CardTitle>
                <span className="font-mono text-[0.75rem] text-ink-3">
                  {usedThisMonth}
                  {unlimited ? "" : ` / ${planLimit}`} docs
                </span>
              </CardHeader>
              <CardBody>
                {unlimited ? (
                  <p className="text-sm text-ink-3">Uso ilimitado en este plan.</p>
                ) : (
                  <Progress value={usedThisMonth} max={planLimit} />
                )}
              </CardBody>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PLANS.map((plan) => {
                const active = plan.id === org.plan;
                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      "flex flex-col p-5",
                      active && "border-ink ring-1 ring-ink",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="label-tec">{PLAN_LABEL[plan.id]}</span>
                      {active && <IconCheck width={16} height={16} className="text-ink" />}
                    </div>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                      {plan.precio}
                      {plan.id !== "empresa" && (
                        <span className="text-sm font-normal text-ink-3"> /mes</span>
                      )}
                    </p>
                    <p className="mt-1 text-[0.8125rem] text-ink-3">{plan.desc}</p>
                    <ul className="mt-4 flex-1 space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[0.8125rem] text-ink-2">
                          <IconCheck width={15} height={15} className="mt-0.5 shrink-0 text-ink-3" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={active ? "secondary" : "primary"}
                      size="sm"
                      className="mt-5 w-full"
                      disabled={active}
                      onClick={() => {
                        setPlan(plan.id);
                        info(
                          `Plan ${PLAN_LABEL[plan.id]}`,
                          "En Fase 6 esto abre Stripe Checkout / Customer Portal.",
                        );
                      }}
                    >
                      {active ? "Plan actual" : `Cambiar a ${PLAN_LABEL[plan.id]}`}
                    </Button>
                    <p className="mt-2 text-center font-mono text-[0.625rem] uppercase tracking-wide text-muted">
                      {isFinite(PLAN_LIMITS[plan.id])
                        ? `${PLAN_LIMITS[plan.id]} docs / mes`
                        : "sin límite"}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </Section>

        <Section title="Datos de demostración" description="mnnsor guarda esta demo en tu navegador. Puedes reiniciarla en cualquier momento.">
          <Card>
            <CardBody className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">Reiniciar datos</p>
                <p className="mt-0.5 text-[0.8125rem] text-ink-3">
                  Restaura obras y documentos de ejemplo. No afecta ningún servidor.
                </p>
              </div>
              <Button variant="danger" onClick={() => setResetOpen(true)}>
                Reiniciar demo
              </Button>
            </CardBody>
          </Card>
        </Section>
      </Container>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reiniciar datos de demostración"
        description="Se restauran las obras y documentos de ejemplo. Perderás lo que hayas creado en esta demo."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                reset();
                setResetOpen(false);
                success("Demo reiniciada", "Se restauraron los datos de ejemplo.");
              }}
            >
              Reiniciar
            </Button>
          </>
        }
      />
    </>
  );
}
