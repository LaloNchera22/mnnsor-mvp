import { Wordmark } from "@/components/ui/Wordmark";
import { ObraSelector } from "./ObraSelector";
import { PlanBadge } from "./PlanBadge";

/**
 * Barra superior del dashboard: marca, selector de obra y estado del plan.
 * En Fase 1 los datos son placeholders — se conectan a Supabase en fases 2–3.
 */
export function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-concreto-dark bg-papel/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Wordmark />
        <div className="hidden h-6 w-px bg-concreto-dark sm:block" />
        <ObraSelector />
        <div className="ml-auto flex items-center gap-3">
          <PlanBadge />
        </div>
      </div>
    </header>
  );
}
