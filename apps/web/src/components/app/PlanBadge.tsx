"use client";

import Link from "next/link";
import { PLAN_LABEL, useStore } from "@/lib/store";
import { Progress } from "@/components/ui/Progress";

/** Indicador de plan y consumo del mes. Enlaza a facturación en ajustes. */
export function PlanBadge() {
  const { org, usedThisMonth, planLimit, ready } = useStore();

  if (!ready) return <div className="skeleton hidden h-9 w-40 rounded-md sm:block" />;

  const unlimited = !isFinite(planLimit);
  const near = !unlimited && usedThisMonth / planLimit >= 0.8;

  return (
    <Link
      href="/ajustes#plan"
      className="hidden items-center gap-3 rounded-md border border-line bg-surface px-3 py-1.5 transition-colors hover:border-line-strong hover:bg-surface-2 sm:flex"
      title="Ver plan y consumo"
    >
      <span className="label-tec">{PLAN_LABEL[org.plan]}</span>
      <span className="h-4 w-px bg-line" />
      <span className="flex flex-col gap-1">
        <span className="font-mono text-[0.6875rem] leading-none text-ink-2">
          {usedThisMonth}
          {unlimited ? "" : ` / ${planLimit}`} docs
        </span>
        {!unlimited && (
          <Progress
            value={usedThisMonth}
            max={planLimit}
            className="w-24"
            label="Documentos usados este mes"
          />
        )}
      </span>
      {near && (
        <span className="font-mono text-[0.625rem] font-semibold uppercase text-ink">
          Casi al límite
        </span>
      )}
    </Link>
  );
}
