import {
  IconDashboard,
  IconDocs,
  IconObras,
  IconSettings,
} from "@/components/ui/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: (p: { width?: number; height?: number }) => React.ReactNode;
}

export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Inicio", icon: IconDashboard },
  { href: "/obras", label: "Obras", icon: IconObras },
  { href: "/documentos", label: "Documentos", icon: IconDocs },
  { href: "/ajustes", label: "Ajustes", icon: IconSettings },
];
