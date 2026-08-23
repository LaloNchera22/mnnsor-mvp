"use client";

import { useEffect, useState } from "react";
import { useOnline } from "@/lib/useOnline";
import { IconInstall, IconWifiOff, IconX } from "@/components/ui/icons";

/*
 * Controlador PWA (cliente):
 *  - registra el service worker (public/sw.js) para captura offline,
 *  - muestra un aviso sobrio cuando se pierde la conexión (las obras tienen
 *    pésima señal): la captura sigue guardándose en el dispositivo,
 *  - ofrece instalar la app cuando el navegador lo permite.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALL_DISMISSED_KEY = "mnnsor-install-dismissed";

export function PwaController() {
  const online = useOnline();
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(true);

  // Registro del service worker.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Evitar registrar en desarrollo (HMR): sólo en producción.
    if (process.env.NODE_ENV !== "production") return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* sin SW la app sigue funcionando, sólo sin offline */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // Prompt de instalación.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY) === "1";
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
      if (!dismissed) setInstallDismissed(false);
    };
    const onInstalled = () => {
      setInstallEvt(null);
      setInstallDismissed(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installEvt) return;
    await installEvt.prompt();
    await installEvt.userChoice.catch(() => undefined);
    setInstallEvt(null);
    setInstallDismissed(true);
  }

  function dismissInstall() {
    setInstallDismissed(true);
    try {
      localStorage.setItem(INSTALL_DISMISSED_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {/* Aviso de sin conexión. */}
      {!online && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-line-strong bg-ink text-on-ink print:hidden"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-4 py-2.5 text-[0.8125rem]">
            <IconWifiOff width={16} height={16} className="shrink-0" />
            <span className="font-medium">Sin conexión.</span>
            <span className="text-on-ink/80">
              Puedes seguir capturando; se guarda en tu dispositivo y se
              sincroniza al recuperar señal.
            </span>
          </div>
        </div>
      )}

      {/* Invitación a instalar. */}
      {installEvt && !installDismissed && online && (
        <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-sm rounded-lg border border-line-strong bg-raised p-3 shadow-lg print:hidden sm:left-auto sm:right-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line-strong bg-surface-2 text-ink">
              <IconInstall width={18} height={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">Instala mnnsor</p>
              <p className="mt-0.5 text-[0.8125rem] text-ink-3">
                Ábrela como app y captura aunque la obra no tenga señal.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={install}
                  className="inline-flex h-8 items-center rounded bg-ink px-3 text-[0.8125rem] font-medium text-on-ink hover:bg-ink/90"
                >
                  Instalar
                </button>
                <button
                  onClick={dismissInstall}
                  className="inline-flex h-8 items-center rounded px-3 text-[0.8125rem] font-medium text-ink-3 hover:bg-surface-2 hover:text-ink"
                >
                  Ahora no
                </button>
              </div>
            </div>
            <button
              onClick={dismissInstall}
              aria-label="Cerrar"
              className="shrink-0 rounded p-1 text-ink-3 hover:bg-surface-2 hover:text-ink"
            >
              <IconX width={15} height={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
