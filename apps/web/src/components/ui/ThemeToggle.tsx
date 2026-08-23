"use client";

import { useTheme, type Theme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import { IconMonitor, IconMoon, IconSun } from "@/components/ui/icons";

const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Claro", icon: <IconSun width={15} height={15} /> },
  { value: "dark", label: "Oscuro", icon: <IconMoon width={15} height={15} /> },
  { value: "system", label: "Sistema", icon: <IconMonitor width={15} height={15} /> },
];

/** Segmented control claro / oscuro / sistema. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="inline-flex items-center gap-0.5 rounded-md border border-line bg-surface-2 p-0.5"
    >
      {options.map((o) => {
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            aria-label={o.label}
            title={o.label}
            onClick={() => setTheme(o.value)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded transition-colors",
              active
                ? "bg-surface text-ink shadow-xs"
                : "text-ink-3 hover:text-ink",
            )}
          >
            {o.icon}
          </button>
        );
      })}
    </div>
  );
}

/** Botón único que alterna claro/oscuro (para la barra superior compacta). */
export function ThemeToggleButton() {
  const { resolved, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={resolved === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={resolved === "dark" ? "Tema claro" : "Tema oscuro"}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {resolved === "dark" ? (
        <IconSun width={18} height={18} />
      ) : (
        <IconMoon width={18} height={18} />
      )}
    </button>
  );
}
