/**
 * Marca mnnsor. Logotipo en minúsculas con marca de acento ámbar de
 * seguridad — identidad industrial.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className="font-mono text-lg font-semibold tracking-tight text-charcoal">
        mnnsor
      </span>
      <span aria-hidden className="h-2 w-2 translate-y-[-1px] bg-ambar" />
    </span>
  );
}
