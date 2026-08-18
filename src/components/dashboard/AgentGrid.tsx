import { AGENTS } from "@/lib/agents";

/**
 * Grid de los 7 agentes — el menú principal del dashboard.
 * En Fase 3+ cada tarjeta enruta a `/agentes/[docType]`. En Fase 1 son
 * accesos visuales (aún sin flujo de captura).
 */
export function AgentGrid() {
  return (
    <section aria-labelledby="agentes-titulo">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="agentes-titulo" className="text-sm font-semibold text-charcoal">
          Agentes
        </h2>
        <span className="label-tec">{AGENTS.length} documentos</span>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent) => (
          <li key={agent.docType}>
            <div className="group flex h-full flex-col rounded-md border border-concreto-dark bg-white/50 p-4 transition-colors hover:border-charcoal-600">
              <div className="mb-2 flex items-center justify-between">
                <span className="label-tec text-ambar-600">{agent.slug}</span>
                <span aria-hidden className="h-1.5 w-1.5 bg-concreto-dark" />
              </div>
              <h3 className="text-base font-semibold text-charcoal">
                {agent.nombre}
              </h3>
              <p className="mt-1 text-sm leading-snug text-charcoal-600">
                {agent.descripcion}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
