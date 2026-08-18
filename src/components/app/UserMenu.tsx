"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useToast } from "@/components/ui/Toast";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/Menu";
import {
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
  IconUser,
} from "@/components/ui/icons";

export function UserMenu() {
  const router = useRouter();
  const { org } = useStore();
  const { resolved, toggle } = useTheme();
  const { info } = useToast();

  const initials = org.nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Menu
      align="end"
      trigger={({ open, toggle: t }) => (
        <button
          onClick={t}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Menú de cuenta"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-ink font-mono text-xs font-semibold text-on-ink transition-transform hover:scale-105"
        >
          {initials || "M"}
        </button>
      )}
    >
      {({ close }) => (
        <div className="min-w-[15rem]">
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-semibold text-ink">{org.nombre}</p>
            <p className="truncate text-[0.75rem] text-ink-3">
              liebano.pacheco.eduardo@gmail.com
            </p>
          </div>
          <MenuSeparator />
          <MenuLabel>Cuenta</MenuLabel>
          <MenuItem
            icon={<IconUser width={15} height={15} />}
            onClick={() => {
              close();
              router.push("/ajustes#perfil");
            }}
          >
            Perfil y organización
          </MenuItem>
          <MenuItem
            icon={<IconSettings width={15} height={15} />}
            onClick={() => {
              close();
              router.push("/ajustes");
            }}
          >
            Ajustes
          </MenuItem>
          <MenuItem
            icon={
              resolved === "dark" ? (
                <IconSun width={15} height={15} />
              ) : (
                <IconMoon width={15} height={15} />
              )
            }
            onClick={toggle}
          >
            {resolved === "dark" ? "Tema claro" : "Tema oscuro"}
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            destructive
            icon={<IconLogout width={15} height={15} />}
            onClick={() => {
              close();
              info("Sesión cerrada", "En Fase 2 esto termina la sesión de Supabase.");
              router.push("/login");
            }}
          >
            Cerrar sesión
          </MenuItem>
        </div>
      )}
    </Menu>
  );
}
