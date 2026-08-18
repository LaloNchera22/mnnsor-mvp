"use client";

import { useEffect, useState } from "react";

/** Estado de conexión del navegador, reactivo a online/offline. */
export function useOnline(): boolean {
  // Se asume online en el primer render (SSR) para no parpadear.
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}
