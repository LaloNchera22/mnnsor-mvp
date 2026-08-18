import type { Config } from "tailwindcss";

/**
 * Sistema de diseño mnnsor — industrial y técnico.
 * Paleta: charcoal, concreto, papel, acento ámbar de seguridad.
 * Tipografías: IBM Plex Sans (cuerpo) + IBM Plex Mono (etiquetas, folios, datos).
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "#1a1c1d",
          800: "#25282a",
          700: "#33373a",
          600: "#4a4f53",
        },
        concreto: {
          DEFAULT: "#dedfda",
          dark: "#c7c9c2",
        },
        papel: "#f5f5f1",
        ambar: {
          DEFAULT: "#f5a300",
          600: "#d68f00",
        },
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "2px",
        md: "3px",
        lg: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
