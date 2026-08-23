"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AGENTS } from "@/lib/agents";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { MAIN_NAV } from "@/components/app/nav";
import { IconX } from "@/components/ui/icons";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="rounded-md focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          aria-label="mnnsor — inicio"
        >
          <Logo priority wordmarkHeight={15} />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Principal">
        <ul className="space-y-0.5">
          {MAIN_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-ink text-on-ink"
                      : "text-ink-2 hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  <Icon width={18} height={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 mb-2 px-3">
          <span className="label-tec">Generar documento</span>
        </div>
        <ul className="space-y-0.5">
          {AGENTS.map((a) => {
            const href = `/agentes/${a.docType}`;
            const active = isActive(pathname, href);
            return (
              <li key={a.docType}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-surface-2 font-medium text-ink"
                      : "text-ink-2 hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-8 shrink-0 items-center justify-center rounded border font-mono text-[0.625rem] font-semibold tracking-tight",
                      active
                        ? "border-ink bg-ink text-on-ink"
                        : "border-line-strong text-ink-3 group-hover:border-ink/40 group-hover:text-ink",
                    )}
                  >
                    {a.slug}
                  </span>
                  <span className="truncate">{a.nombre}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-line px-5 py-3">
        <p className="label-tec">v1 · Bajío / Querétaro</p>
      </div>
    </div>
  );
}

/** Sidebar fijo de escritorio. */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:block">
      <div className="sticky top-0 h-screen">
        <SidebarContent />
      </div>
    </aside>
  );
}

/** Drawer de sidebar para móvil. */
export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className={cn(
          "absolute left-0 top-0 h-full w-72 max-w-[85%] border-r border-line bg-surface shadow-pop transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink lg:hidden"
          aria-label="Cerrar menú"
        >
          <IconX width={18} height={18} />
        </button>
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}
