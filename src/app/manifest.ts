import type { MetadataRoute } from "next";

/*
 * Manifest PWA. Las obras tienen pésima señal: instalar mnnsor como app y
 * capturar sin conexión es un diferenciador real en construcción. El service
 * worker (public/sw.js) cachea el shell para que la app abra offline; el store
 * ya persiste la captura en el dispositivo y sincroniza al recuperar señal.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "mnnsor — documentación de obra",
    short_name: "mnnsor",
    description:
      "Notas de campo → documento formal, listo para firmar. Funciona sin conexión.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "es-MX",
    dir: "ltr",
    background_color: "#f4f4f1",
    theme_color: "#0c0d0e",
    categories: ["business", "productivity", "utilities"],
    icons: [
      { src: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
