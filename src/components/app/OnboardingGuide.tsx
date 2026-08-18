"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Container } from "@/components/app/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import {
  IconArrowRight,
  IconBolt,
  IconMic,
  IconObras,
  IconShield,
} from "@/components/ui/icons";

/*
 * Onboarding de primer uso.
 *
 * En vez de caer en un dashboard con datos semilla de ejemplo, la primera vez
 * guiamos al usuario a crear su primera obra y generar su primer documento.
 * Quien prefiera curiosear puede cargar la demo con datos de ejemplo.
 */

const PASOS = [
  {
    icon: <IconMic width={18} height={18} />,
    titulo: "Dicta como hablas en campo",
    texto: "Con casco y guantes no se teclea. Toca el micrófono y habla; mnnsor escribe.",
  },
  {
    icon: <IconBolt width={18} height={18} />,
    titulo: "mnnsor lo redacta",
    texto: "Convierte tus notas en el documento formal, con membrete y bloque de firmas.",
  },
  {
    icon: <IconShield width={18} height={18} />,
    titulo: "Nada inventado",
    texto: "Puedes ver qué salió de tus notas y qué es estructura del formato.",
  },
];

export function OnboardingGuide() {
  const router = useRouter();
  const { addObra, loadDemo, completeOnboarding, org } = useStore();
  const { resolved } = useTheme();
  const { success } = useToast();

  const [nombre, setNombre] = useState("");
  const [cliente, setCliente] = useState(org.nombre);
  const [ubicacion, setUbicacion] = useState("");
  const [touched, setTouched] = useState(false);

  const wordmark =
    resolved === "dark" ? "/brand/wordmark-white.png" : "/brand/wordmark-black.png";
  const valid = nombre.trim().length >= 3;

  function empezar(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    const obra = addObra({
      nombre: nombre.trim(),
      cliente: cliente.trim() || "—",
      ubicacion: ubicacion.trim() || "Querétaro, Qro.",
    });
    success("Obra creada", `“${obra.nombre}” está lista. Generemos tu primer documento.`);
    router.push("/agentes/bitacora");
  }

  return (
    <div className="bg-grid min-h-full">
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <Image
              src={wordmark}
              alt="mnnsor"
              width={150}
              height={34}
              className="mx-auto h-7 w-auto"
              priority
            />
            <p className="label-tec mt-5">Bienvenido</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-[2rem]">
              Escribe como hablas en campo
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[0.95rem] leading-relaxed text-ink-3">
              Tus notas crudas —dictadas o escritas— se vuelven el documento
              formal que entregas, listo para firmar. Empecemos por tu primera
              obra; en un minuto tendrás tu primer documento.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PASOS.map((p, i) => (
              <div
                key={p.titulo}
                className="rounded-lg border border-line bg-surface p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-line-strong bg-surface-2 text-ink">
                    {p.icon}
                  </span>
                  <span className="label-tec">Paso {i + 1}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-ink">{p.titulo}</p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-3">
                  {p.texto}
                </p>
              </div>
            ))}
          </div>

          <Card>
            <CardBody className="sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <IconObras width={18} height={18} className="text-ink" />
                <h2 className="text-base font-semibold tracking-tight text-ink">
                  Crea tu primera obra
                </h2>
              </div>
              <form onSubmit={empezar} className="space-y-4">
                <Field
                  label="Nombre de la obra"
                  required
                  error={
                    touched && !valid ? "Escribe al menos 3 caracteres." : undefined
                  }
                >
                  {({ id, describedBy }) => (
                    <Input
                      id={id}
                      aria-describedby={describedBy}
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Residencial Altozano — Torre B"
                      invalid={touched && !valid}
                      autoFocus
                    />
                  )}
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Cliente" hint="opcional">
                    {({ id }) => (
                      <Input
                        id={id}
                        value={cliente}
                        onChange={(e) => setCliente(e.target.value)}
                        placeholder="Constructora del Bajío"
                      />
                    )}
                  </Field>
                  <Field label="Ubicación" hint="opcional">
                    {({ id }) => (
                      <Input
                        id={id}
                        value={ubicacion}
                        onChange={(e) => setUbicacion(e.target.value)}
                        placeholder="Querétaro, Qro."
                      />
                    )}
                  </Field>
                </div>
                <div className="flex flex-col-reverse items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      loadDemo();
                      success("Datos de ejemplo cargados", "Explora mnnsor con obras y documentos de muestra.");
                    }}
                    className="text-[0.8125rem] font-medium text-ink-3 underline-offset-2 hover:text-ink hover:underline"
                  >
                    Prefiero explorar con datos de ejemplo
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    rightIcon={<IconArrowRight width={16} height={16} />}
                  >
                    Crear obra y continuar
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <p className="mt-6 text-center text-[0.75rem] text-muted">
            ¿Solo quieres ver el panel?{" "}
            <button
              type="button"
              onClick={completeOnboarding}
              className="font-medium text-ink-3 underline-offset-2 hover:text-ink hover:underline"
            >
              Saltar por ahora
            </button>
          </p>
        </div>
      </Container>
    </div>
  );
}
