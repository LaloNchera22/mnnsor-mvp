"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggleButton } from "@/components/ui/ThemeToggle";
import { createOrganization } from "./actions";
import { useToast } from "@/components/ui/Toast";
import { IconArrowRight } from "@/components/ui/icons";

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const { warning } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("orgName", orgName);

    const result = await createOrganization(formData);

    if (result?.error) {
       warning("Error al crear organización", result.error);
       setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex items-center justify-between p-5 border-b border-line">
        <Logo priority />
        <ThemeToggleButton />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Configura tu organización
            </h1>
            <p className="mt-2 text-sm text-ink-3">
              ¿Cómo se llama tu constructora o empresa?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nombre de la organización">
              {({ id }) => (
                <Input
                  id={id}
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Ej. Constructora del Bajío"
                  autoFocus
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
              Comenzar a documentar
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
