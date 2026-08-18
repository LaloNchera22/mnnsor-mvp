import Image from "next/image";
import { cn } from "@/lib/utils";

/*
 * Marca mnnsor. Los logos provistos (isotipo pixel-art + wordmark) son
 * monocromo con fondo transparente; servimos la variante negra en tema claro
 * y la blanca en tema oscuro mediante clases `dark:` — sin JS, sin flash.
 * Se sirven desde /public/brand para no depender de tipos de import de imagen.
 */

const ISO = { w: 1401, h: 1516 };
const WORD = { w: 1851, h: 274 };

export function Isotipo({
  size = 28,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  const h = Math.round((size * ISO.h) / ISO.w);
  return (
    <span className={cn("relative inline-block", className)} style={{ width: size, height: h }}>
      <Image src="/brand/isotipo-black.png" alt="" width={size} height={h} priority={priority} className="block dark:hidden" />
      <Image src="/brand/isotipo-white.png" alt="" width={size} height={h} priority={priority} className="hidden dark:block" />
    </span>
  );
}

export function Wordmark({
  height = 18,
  className = "",
  priority = false,
}: {
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const w = Math.round((height * WORD.w) / WORD.h);
  return (
    <span className={cn("relative inline-block", className)} style={{ width: w, height }}>
      <Image src="/brand/wordmark-black.png" alt="mnnsor" width={w} height={height} priority={priority} className="block dark:hidden" />
      <Image src="/brand/wordmark-white.png" alt="mnnsor" width={w} height={height} priority={priority} className="hidden dark:block" />
    </span>
  );
}

/** Isotipo + wordmark alineados (uso principal de marca). */
export function Logo({
  className = "",
  wordmarkHeight = 16,
  priority = false,
}: {
  className?: string;
  wordmarkHeight?: number;
  priority?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Isotipo size={26} priority={priority} />
      <Wordmark height={wordmarkHeight} priority={priority} />
      <span className="sr-only">mnnsor — documentación de obra</span>
    </span>
  );
}
