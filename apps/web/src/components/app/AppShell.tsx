"use client";

import { useState } from "react";
import { CommandPaletteProvider } from "@/components/ui/CommandPalette";
import { Sidebar, MobileSidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <CommandPaletteProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setMenuOpen(true)} />
          <main id="contenido" className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </CommandPaletteProvider>
  );
}
