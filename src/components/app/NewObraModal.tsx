"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";

export function NewObraModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const { addObra } = useStore();
  const { success } = useToast();
  const [nombre, setNombre] = useState("");
  const [cliente, setCliente] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = nombre.trim().length >= 3;

  function reset() {
    setNombre("");
    setCliente("");
    setUbicacion("");
    setTouched(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    const obra = addObra({
      nombre: nombre.trim(),
      cliente: cliente.trim() || "—",
      ubicacion: ubicacion.trim() || "Querétaro, Qro.",
    });
    success("Obra creada", `“${obra.nombre}” está lista para documentar.`);
    reset();
    onClose();
    onCreated?.(obra.id);
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Nueva obra"
      description="Cada documento se archiva por obra. Puedes cambiar estos datos después."
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form="new-obra-form">
            Crear obra
          </Button>
        </>
      }
    >
      <form id="new-obra-form" onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Nombre de la obra"
          required
          error={touched && !valid ? "Escribe al menos 3 caracteres." : undefined}
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
      </form>
    </Modal>
  );
}
