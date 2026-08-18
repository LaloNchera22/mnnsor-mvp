/**
 * Selector de obra. Placeholder de Fase 1: sin obras aún.
 * En Fase 3 se conecta al CRUD de `obras` (filtrado por organización vía RLS).
 */
export function ObraSelector() {
  return (
    <button
      type="button"
      disabled
      className="group flex items-center gap-2 rounded border border-concreto-dark bg-white/40 px-3 py-1.5 text-left disabled:cursor-not-allowed"
    >
      <span className="label-tec">Obra</span>
      <span className="text-sm text-charcoal-600">Sin obras — crea la primera</span>
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="h-3 w-3 text-charcoal-600"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M3 4.5 6 7.5 9 4.5" />
      </svg>
    </button>
  );
}
