"use client";

import { useRef } from "react";
import type { Photo } from "@/lib/generate";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { IconCamera, IconImage, IconTrash } from "@/components/ui/icons";

/*
 * Captura de fotos desde el móvil para el reporte fotográfico.
 *
 * En el móvil, `capture="environment"` abre directamente la cámara trasera;
 * en escritorio, el mismo input permite elegir archivos. Las fotos se guardan
 * como data URLs (demo, en el cliente). En producción se suben a Supabase
 * Storage y la descripción técnica por foto la redacta Claude (visión).
 */

const MAX_LADO = 1280; // px — reescala para no reventar localStorage

async function fileToPhoto(file: File): Promise<Photo> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const resized = await downscale(dataUrl).catch(() => dataUrl);
  return { id: uid("ph_"), dataUrl: resized, caption: "" };
}

function downscale(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const escala = Math.min(1, MAX_LADO / Math.max(img.width, img.height));
      const w = Math.round(img.width * escala);
      const h = Math.round(img.height * escala);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("sin canvas"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export function PhotoCapture({
  photos,
  onChange,
}: {
  photos: Photo[];
  onChange: (next: Photo[]) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function add(files: FileList | null) {
    if (!files || files.length === 0) return;
    const nuevos = await Promise.all(
      Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .map(fileToPhoto),
    );
    onChange([...photos, ...nuevos]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<IconCamera width={15} height={15} />}
          onClick={() => cameraRef.current?.click()}
        >
          Tomar foto
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<IconImage width={15} height={15} />}
          onClick={() => galleryRef.current?.click()}
        >
          Desde galería
        </Button>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            void add(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void add(e.target.files);
            e.target.value = "";
          }}
        />
        {photos.length > 0 && (
          <span className="label-tec">{photos.length} foto(s)</span>
        )}
      </div>

      {photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((ph, idx) => (
            <li
              key={ph.id}
              className="overflow-hidden rounded-md border border-line-strong bg-surface-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ph.dataUrl}
                alt={ph.caption || `Foto ${idx + 1}`}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="flex items-start gap-1 p-1.5">
                <input
                  value={ph.caption}
                  onChange={(e) =>
                    onChange(
                      photos.map((p) =>
                        p.id === ph.id ? { ...p, caption: e.target.value } : p,
                      ),
                    )
                  }
                  placeholder={`Foto ${idx + 1}: describe qué muestra`}
                  className="min-w-0 flex-1 rounded bg-transparent px-1 py-0.5 text-[0.75rem] text-ink outline-none placeholder:text-muted"
                />
                <button
                  type="button"
                  onClick={() => onChange(photos.filter((p) => p.id !== ph.id))}
                  className="shrink-0 rounded p-1 text-ink-3 hover:bg-surface hover:text-ink"
                  title="Quitar foto"
                  aria-label="Quitar foto"
                >
                  <IconTrash width={13} height={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
