import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconChevronRight } from "@/components/ui/icons";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

interface Crumb {
  label: string;
  href?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
}) {
  return (
    <div className="border-b border-line bg-surface">
      <Container className="py-6 sm:py-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Ruta" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem]">
              {breadcrumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {c.href ? (
                    <Link href={c.href} className="text-ink-3 transition-colors hover:text-ink">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-ink-2">{c.label}</span>
                  )}
                  {i < breadcrumbs.length - 1 && (
                    <IconChevronRight width={13} height={13} className="text-muted" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow && <p className="label-tec mb-1.5">{eyebrow}</p>}
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-3">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
        </div>
      </Container>
    </div>
  );
}
