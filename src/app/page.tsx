import { TopBar } from "@/components/dashboard/TopBar";
import { AgentGrid } from "@/components/dashboard/AgentGrid";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

/**
 * Home / dashboard — el menú principal de mnnsor.
 *
 * Fase 1: shell visual con el sistema de diseño industrial. Datos aún son
 * placeholders; auth (Fase 2), obras y motor de agentes (Fase 3) los conectan.
 */
export default function Home() {
  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="label-tec">Documentación de obra asistida por IA</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-charcoal">
            Notas de campo → documento formal, listo para firmar
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-charcoal-600">
            Escribe tus notas crudas o sube tu propio formato; mnnsor te
            devuelve el documento en el formato que entregas. Elige un agente
            para empezar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem]">
          <AgentGrid />
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <RecentActivity />
          </aside>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="label-tec text-charcoal-600">
          mnnsor · v1 · Bajío / Querétaro
        </p>
      </footer>
    </div>
  );
}
