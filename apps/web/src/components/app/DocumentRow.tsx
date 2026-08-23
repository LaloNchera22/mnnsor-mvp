import Link from "next/link";
import type { DocumentItem } from "@/lib/store";
import { getAgent } from "@/lib/agents";
import { timeAgo } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { IconChevronRight } from "@/components/ui/icons";

export function DocumentRow({
  doc,
  obraNombre,
}: {
  doc: DocumentItem;
  obraNombre?: string;
}) {
  const agent = getAgent(doc.docType);
  return (
    <Link
      href={`/documentos/${doc.id}`}
      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink sm:gap-4"
    >
      <span className="flex h-9 w-11 shrink-0 items-center justify-center rounded border border-line-strong font-mono text-[0.6875rem] font-semibold text-ink-3 group-hover:border-ink/40 group-hover:text-ink">
        {agent?.slug}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{doc.titulo}</span>
        <span className="mt-0.5 flex items-center gap-2 font-mono text-[0.6875rem] text-ink-3">
          <span>{doc.folio}</span>
          {obraNombre && (
            <>
              <span className="text-muted">·</span>
              <span className="truncate">{obraNombre}</span>
            </>
          )}
        </span>
      </span>
      <span className="hidden shrink-0 text-[0.75rem] text-ink-3 sm:block">
        {timeAgo(doc.updatedAt)}
      </span>
      <span className="shrink-0">
        <StatusBadge status={doc.status} />
      </span>
      <IconChevronRight
        width={16}
        height={16}
        className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink-3"
      />
    </Link>
  );
}
