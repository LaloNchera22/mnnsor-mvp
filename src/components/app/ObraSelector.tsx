"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/Menu";
import { NewObraModal } from "@/components/app/NewObraModal";
import { IconChevronDown, IconCheck, IconObras, IconPlus } from "@/components/ui/icons";

export function ObraSelector() {
  const { obras, currentObra, setCurrentObra, ready } = useStore();
  const [newOpen, setNewOpen] = useState(false);

  if (!ready) {
    return <div className="skeleton h-9 w-44 rounded-md" />;
  }

  return (
    <>
      <Menu
        align="start"
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex max-w-[16rem] items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 text-left transition-colors hover:border-line-strong hover:bg-surface-2"
          >
            <IconObras width={16} height={16} className="shrink-0 text-ink-3" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium leading-tight text-ink">
                {currentObra?.nombre ?? "Sin obra"}
              </span>
              {currentObra && (
                <span className="block truncate font-mono text-[0.625rem] uppercase tracking-wide text-ink-3">
                  {currentObra.ubicacion}
                </span>
              )}
            </span>
            <IconChevronDown width={15} height={15} className="ml-auto shrink-0 text-ink-3" />
          </button>
        )}
      >
        {({ close }) => (
          <div className="min-w-[15rem]">
            <MenuLabel>Cambiar de obra</MenuLabel>
            {obras.map((o) => (
              <MenuItem
                key={o.id}
                onClick={() => {
                  setCurrentObra(o.id);
                  close();
                }}
                icon={
                  <IconCheck
                    width={15}
                    height={15}
                    className={cn(o.id === currentObra?.id ? "opacity-100" : "opacity-0")}
                  />
                }
              >
                {o.nombre}
              </MenuItem>
            ))}
            <MenuSeparator />
            <MenuItem
              icon={<IconPlus width={15} height={15} />}
              onClick={() => {
                close();
                setNewOpen(true);
              }}
            >
              Nueva obra
            </MenuItem>
          </div>
        )}
      </Menu>
      <NewObraModal open={newOpen} onClose={() => setNewOpen(false)} />
    </>
  );
}
