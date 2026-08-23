import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { StoreProvider } from "@/lib/store";
import { PwaController } from "@/components/pwa/PwaController";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mnnsor.com"),
  title: {
    default: "mnnsor — documentación de obra asistida por IA",
    template: "%s · mnnsor",
  },
  description:
    "Documentación de obra asistida por IA: notas de campo → documento formal, listo para firmar.",
  applicationName: "mnnsor",
  // El manifest lo sirve app/manifest.ts en /manifest.webmanifest y Next
  // inyecta el <link rel="manifest"> automáticamente.
  appleWebApp: {
    capable: true,
    title: "mnnsor",
    statusBarStyle: "default",
  },
  authors: [{ name: "mnnsor" }],
  keywords: [
    "documentación de obra",
    "bitácora",
    "construcción",
    "IA",
    "Querétaro",
    "Bajío",
  ],
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "mnnsor — documentación de obra asistida por IA",
    description:
      "Notas de campo → documento formal, listo para firmar. En el formato que tú entregas.",
    type: "website",
    locale: "es_MX",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0d0e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {/* Salto de contenido para lectores de pantalla / teclado. */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-ink"
        >
          Saltar al contenido
        </a>
        <ThemeProvider>
          <StoreProvider>
            <ToastProvider>
              {children}
              <PwaController />
            </ToastProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
