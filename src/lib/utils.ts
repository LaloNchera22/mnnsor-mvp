/**
 * Utilidades pequeñas y sin dependencias.
 */

type ClassValue = string | number | false | null | undefined;

/** Une clases condicionales (ligero, sin merge de conflictos de Tailwind). */
export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Formatea una fecha ISO a algo corto y legible en español. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** "hace 3 h", "hace 2 d" — tiempo relativo compacto. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 60) return "hace un momento";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `hace ${days} d`;
  return formatDate(iso);
}

/** Folio corto tipo BIT-2408-014. */
export function folio(slug: string, seq: number): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${slug}-${yy}${mm}-${String(seq).padStart(3, "0")}`;
}

/** ID corto y único para datos mock. */
export function uid(prefix = ""): string {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}`;
}
