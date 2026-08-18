import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { IconArrowRight } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <div className="bg-grid pointer-events-none fixed inset-0 opacity-40" aria-hidden />
      <div className="relative">
        <Logo priority wordmarkHeight={18} />
        <p className="mt-10 font-mono text-6xl font-semibold tracking-tight text-ink">404</p>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink">
          No encontramos esa página
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-3">
          El enlace puede estar roto o el documento se movió. Vuelve al inicio para
          seguir documentando tu obra.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <ButtonLink href="/" variant="primary" rightIcon={<IconArrowRight width={16} height={16} />}>
            Ir al inicio
          </ButtonLink>
          <ButtonLink href="/documentos" variant="secondary">
            Ver documentos
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
