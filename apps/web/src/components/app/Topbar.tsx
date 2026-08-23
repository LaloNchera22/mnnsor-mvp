"use client";

import { useCommandPalette } from "@/components/ui/CommandPalette";
import { ObraSelector } from "@/components/app/ObraSelector";
import { PlanBadge } from "@/components/app/PlanBadge";
import { UserMenu } from "@/components/app/UserMenu";
import { ThemeToggleButton } from "@/components/ui/ThemeToggle";
import { IconMenu, IconSearch } from "@/components/ui/icons";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { open } = useCommandPalette();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-5">
        <button
          onClick={onOpenMenu}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink lg:hidden"
          aria-label="Abrir menú"
        >
          <IconMenu width={18} height={18} />
        </button>

        <ObraSelector />

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Disparador de búsqueda / paleta de comandos. */}
          <button
            onClick={open}
            className="hidden items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink-3 transition-colors hover:border-line-strong hover:text-ink md:flex"
            aria-label="Buscar (Ctrl o Cmd + K)"
          >
            <IconSearch width={16} height={16} />
            <span>Buscar…</span>
            <kbd className="ml-6 rounded border border-line px-1.5 py-0.5 font-mono text-[0.625rem] text-ink-3">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={open}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink md:hidden"
            aria-label="Buscar"
          >
            <IconSearch width={18} height={18} />
          </button>

          <PlanBadge />
          <ThemeToggleButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
