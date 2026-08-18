/**
 * Actividad reciente. Estado vacío de Fase 1.
 * En Fase 3+ lista los últimos `documents` de la organización.
 */
export function RecentActivity() {
  return (
    <section aria-labelledby="actividad-titulo">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="actividad-titulo" className="text-sm font-semibold text-charcoal">
          Actividad reciente
        </h2>
      </div>
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-concreto-dark bg-white/30 px-6 py-10 text-center">
        <div
          aria-hidden
          className="mb-3 flex h-9 w-9 items-center justify-center border border-concreto-dark"
        >
          <span className="font-mono text-sm text-charcoal-600">—</span>
        </div>
        <p className="text-sm font-medium text-charcoal">Aún no hay documentos</p>
        <p className="mt-1 max-w-xs text-sm text-charcoal-600">
          Cuando generes tu primer documento aparecerá aquí, guardado por obra.
        </p>
      </div>
    </section>
  );
}
