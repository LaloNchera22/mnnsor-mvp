/**
 * Indicador de plan y consumo. Placeholder de Fase 1.
 * En Fase 6 refleja `organizations.plan` y el conteo de `usage_events` del mes.
 */
export function PlanBadge() {
  const plan = "Free";
  const usados = 0;
  const limite = 15;

  return (
    <div className="flex items-center gap-2 rounded border border-concreto-dark bg-white/40 px-3 py-1.5">
      <span className="label-tec">Plan</span>
      <span className="text-sm font-medium text-charcoal">{plan}</span>
      <span aria-hidden className="h-3 w-px bg-concreto-dark" />
      <span className="font-mono text-xs text-charcoal-600">
        {usados}/{limite} docs
      </span>
    </div>
  );
}
