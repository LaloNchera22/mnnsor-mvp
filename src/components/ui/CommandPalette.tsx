"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AGENTS } from "@/lib/agents";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  IconAgents,
  IconDashboard,
  IconDocs,
  IconObras,
  IconSearch,
  IconSettings,
} from "@/components/ui/icons";

interface Command {
  id: string;
  label: string;
  group: string;
  keywords?: string;
  icon: React.ReactNode;
  run: () => void;
}

interface CtxValue {
  open: () => void;
}
const Ctx = createContext<CtxValue | null>(null);

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const { obras, documents, setCurrentObra } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = [
      { id: "nav-dash", label: "Ir al inicio", group: "Navegar", icon: <IconDashboard width={16} height={16} />, run: () => router.push("/") },
      { id: "nav-obras", label: "Ir a obras", group: "Navegar", icon: <IconObras width={16} height={16} />, run: () => router.push("/obras") },
      { id: "nav-docs", label: "Ir a documentos", group: "Navegar", icon: <IconDocs width={16} height={16} />, run: () => router.push("/documentos") },
      { id: "nav-set", label: "Ir a ajustes", group: "Navegar", icon: <IconSettings width={16} height={16} />, run: () => router.push("/ajustes") },
    ];
    const agents: Command[] = AGENTS.map((a) => ({
      id: `agent-${a.docType}`,
      label: `Nuevo: ${a.nombre}`,
      group: "Generar documento",
      keywords: `${a.slug} ${a.descripcion} ${a.categoria}`,
      icon: <IconAgents width={16} height={16} />,
      run: () => router.push(`/agentes/${a.docType}`),
    }));
    const obraCmds: Command[] = obras.map((o) => ({
      id: `obra-${o.id}`,
      label: `Cambiar a obra: ${o.nombre}`,
      group: "Obras",
      keywords: `${o.cliente} ${o.ubicacion}`,
      icon: <IconObras width={16} height={16} />,
      run: () => {
        setCurrentObra(o.id);
        router.push("/");
      },
    }));
    const docCmds: Command[] = documents.slice(0, 8).map((d) => ({
      id: `doc-${d.id}`,
      label: d.titulo,
      group: "Documentos recientes",
      keywords: `${d.folio}`,
      icon: <IconDocs width={16} height={16} />,
      run: () => router.push(`/documentos/${d.id}`),
    }));
    return [...agents, ...nav, ...obraCmds, ...docCmds];
  }, [router, obras, documents, setCurrentObra]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [commands, query]);

  // Reset índice activo cuando cambia el filtro.
  useEffect(() => setActive(0), [query]);

  // Atajo global ⌘K / Ctrl+K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[active];
      if (cmd) {
        close();
        cmd.run();
      }
    }
  };

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade-in" onClick={close} aria-hidden />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Paleta de comandos"
              onKeyDown={onKeyDown}
              className="relative w-full max-w-xl overflow-hidden rounded-xl border border-line-strong bg-raised shadow-pop animate-scale-in"
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <IconSearch width={18} height={18} className="text-ink-3" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar acciones, agentes, obras, documentos…"
                  className="h-14 w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
                  aria-label="Buscar"
                  aria-controls="cmdk-list"
                  aria-activedescendant={filtered[active] ? `cmdk-${filtered[active].id}` : undefined}
                />
                <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[0.625rem] text-ink-3 sm:block">
                  ESC
                </kbd>
              </div>
              <div ref={listRef} id="cmdk-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-ink-3">
                    Sin resultados para “{query}”.
                  </p>
                ) : (
                  filtered.map((c, i) => {
                    const showGroup = i === 0 || filtered[i - 1].group !== c.group;
                    return (
                      <div key={c.id}>
                        {showGroup && (
                          <div className="px-2.5 pb-1 pt-2 label-tec">{c.group}</div>
                        )}
                        <button
                          id={`cmdk-${c.id}`}
                          role="option"
                          aria-selected={i === active}
                          data-idx={i}
                          onMouseEnter={() => setActive(i)}
                          onClick={() => {
                            close();
                            c.run();
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-sm transition-colors",
                            i === active ? "bg-ink text-on-ink" : "text-ink-2 hover:bg-surface-2",
                          )}
                        >
                          <span className={cn(i === active ? "text-on-ink" : "text-ink-3")}>
                            {c.icon}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium">{c.label}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </Ctx.Provider>
  );
}

export function useCommandPalette(): CtxValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCommandPalette debe usarse dentro de <CommandPaletteProvider>");
  return ctx;
}
