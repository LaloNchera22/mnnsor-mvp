import Link from "next/link";
import type { AgentConfig } from "@/lib/agents";
import { IconArrowRight } from "@/components/ui/icons";

export function AgentCard({ agent }: { agent: AgentConfig }) {
  return (
    <Link
      href={`/agentes/${agent.docType}`}
      className="group flex h-full flex-col rounded-lg border border-line bg-surface p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-8 min-w-[2.75rem] items-center justify-center rounded border border-ink bg-ink px-2 font-mono text-xs font-semibold tracking-tight text-on-ink">
          {agent.slug}
        </span>
        <span className="label-tec">{agent.categoria}</span>
      </div>
      <h3 className="text-[0.95rem] font-semibold tracking-tight text-ink">
        {agent.nombre}
      </h3>
      <p className="mt-1 flex-1 text-[0.8125rem] leading-snug text-ink-3">
        {agent.descripcion}
      </p>
      <span className="mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink-2 transition-colors group-hover:text-ink">
        Generar
        <IconArrowRight
          width={15}
          height={15}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
