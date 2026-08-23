"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo, Isotipo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { ThemeToggleButton } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import { IconArrowRight, IconBolt, IconShield, IconSignature } from "@/components/ui/icons";

const FEATURES = [
  { icon: <IconBolt width={18} height={18} />, title: "De la nota al documento", desc: "Escribe como hablas en campo; recibe el formato formal." },
  { icon: <IconSignature width={18} height={18} />, title: "Listo para firmar", desc: "Estructura por secciones y bloque de firmas incluido." },
  { icon: <IconShield width={18} height={18} />, title: "Sin inventar datos", desc: "Redacta solo con lo que capturaste. Tú revisas y firmas." },
];

export default function LoginPage() {
  const router = useRouter();
  const { info } = useToast();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Demo: Auth real (Supabase) llega en Fase 2.
    window.setTimeout(() => router.push("/"), 700);
  }

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Panel de marca (siempre oscuro para lucir el isotipo) */}
      <aside className="relative hidden w-1/2 overflow-hidden bg-ink lg:flex">
        <div className="bg-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            {/* Isotipo + wordmark blancos sobre panel oscuro */}
            <ForceWhiteLogo />
          </div>
          <div>
            <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-white">
              Documentación de obra, sin el papeleo.
            </h2>
            <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-white/70">
              El ingeniero escribe notas crudas de campo y mnnsor devuelve el
              documento formal, en el formato que entrega, listo para firmar.
            </p>
            <ul className="mt-8 space-y-4">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/20 text-white">
                    {f.icon}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-white">{f.title}</span>
                    <span className="block text-[0.8125rem] text-white/60">{f.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-white/40">
            v1 · Bajío / Querétaro
          </p>
        </div>
      </aside>

      {/* Formulario */}
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-5">
          <div className="lg:hidden">
            <Logo priority />
          </div>
          <div className="ml-auto">
            <ThemeToggleButton />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-16">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <p className="label-tec mb-2">Acceso</p>
              <h1 className="text-2xl font-semibold tracking-tight text-ink">
                Entra a mnnsor
              </h1>
              <p className="mt-2 text-sm text-ink-3">
                Documenta tu obra desde donde estés.
              </p>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              leftIcon={<GoogleGlyph />}
              onClick={() => info("Google Sign-In", "El acceso con Google se conecta en Fase 2.")}
            >
              Continuar con Google
            </Button>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="label-tec">o con correo</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Correo">
                {({ id }) => (
                  <Input
                    id={id}
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@constructora.mx"
                  />
                )}
              </Field>
              <Field label="Contraseña">
                {({ id }) => (
                  <Input
                    id={id}
                    type="password"
                    required
                    autoComplete="current-password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="••••••••"
                  />
                )}
              </Field>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
                rightIcon={!loading ? <IconArrowRight width={16} height={16} /> : undefined}
              >
                Entrar
              </Button>
            </form>

            <p className="mt-6 text-center text-[0.8125rem] text-ink-3">
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => info("Registro", "El alta de organizaciones llega en Fase 2.")}
                className="font-medium text-ink underline underline-offset-2"
              >
                Crea tu organización
              </button>
            </p>
            <p className="mt-8 text-center text-[0.6875rem] leading-relaxed text-muted">
              Al continuar aceptas los Términos y el Aviso de Privacidad de mnnsor.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Isotipo + wordmark forzados a blanco sobre el panel oscuro. */
function ForceWhiteLogo() {
  return (
    <span className="dark inline-flex items-center gap-2.5">
      <Isotipo size={30} priority />
      <span className="font-mono text-lg font-semibold tracking-tight text-white">
        mnnsor
      </span>
    </span>
  );
}

function GoogleGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden className="text-ink">
      <path
        fill="currentColor"
        d="M21.35 11.1H12v2.9h5.35c-.25 1.5-1.7 4.4-5.35 4.4-3.2 0-5.8-2.65-5.8-5.9s2.6-5.9 5.8-5.9c1.83 0 3.05.78 3.75 1.45l2.55-2.45C16.7 3.6 14.6 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12s4.1 9.3 9.2 9.3c5.3 0 8.8-3.73 8.8-8.98 0-.6-.07-1.06-.15-1.52z"
      />
    </svg>
  );
}
