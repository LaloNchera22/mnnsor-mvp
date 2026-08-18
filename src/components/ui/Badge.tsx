import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { DocStatus } from "@/lib/store";
import { IconCheckCircle, IconClock, IconEdit } from "@/components/ui/icons";

type BadgeVariant = "solid" | "outline" | "subtle" | "dashed";

const variants: Record<BadgeVariant, string> = {
  solid: "bg-ink text-on-ink border border-ink",
  outline: "bg-transparent text-ink border border-line-strong",
  subtle: "bg-surface-2 text-ink-2 border border-line",
  dashed: "bg-transparent text-ink-3 border border-dashed border-line-strong",
};

export function Badge({
  children,
  variant = "subtle",
  className,
  icon,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em]",
        variants[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/*
 * Estado de documento. En un producto monocromo el estado NO puede depender del
 * color (accesibilidad): usamos forma (relleno vs. contorno vs. punteado) + ícono
 * + texto para que sea distinguible siempre.
 */
export function StatusBadge({ status }: { status: DocStatus }) {
  if (status === "firmado") {
    return (
      <Badge variant="solid" icon={<IconCheckCircle width={12} height={12} />}>
        Firmado
      </Badge>
    );
  }
  if (status === "generado") {
    return (
      <Badge variant="outline" icon={<IconClock width={12} height={12} />}>
        Generado
      </Badge>
    );
  }
  return (
    <Badge variant="dashed" icon={<IconEdit width={12} height={12} />}>
      Borrador
    </Badge>
  );
}
