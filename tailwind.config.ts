import type { Config } from "tailwindcss";

/**
 * Sistema de diseño mnnsor — industrial, técnico y estrictamente monocromo.
 *
 * Sin color de marca: la jerarquía se construye con tinta (ink) sobre papel
 * (paper), peso tipográfico, superficies y líneas de un cabello. El tema
 * (claro / oscuro) se controla con la clase `.dark` en <html>; todos los
 * tokens de color son variables CSS para que un solo set de clases sirva a
 * ambos temas.
 *
 * Tipografías: IBM Plex Sans (cuerpo) + IBM Plex Mono (etiquetas, folios, datos).
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Superficies y tinta (definidas como variables CSS en globals.css).
        paper: "rgb(var(--paper) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        raised: "rgb(var(--raised) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-2": "rgb(var(--ink-2) / <alpha-value>)",
        "ink-3": "rgb(var(--ink-3) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        "line-strong": "rgb(var(--line-strong) / <alpha-value>)",
        // Invertido: usa la tinta como fondo (botón primario, etc.).
        "on-ink": "rgb(var(--on-ink) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        none: "0",
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
        xl: "8px",
      },
      boxShadow: {
        // Sombras sobrias, sin color, coherentes con la estética industrial.
        xs: "0 1px 0 0 rgb(var(--shadow) / 0.04)",
        sm: "0 1px 2px 0 rgb(var(--shadow) / 0.06), 0 1px 1px -1px rgb(var(--shadow) / 0.08)",
        md: "0 2px 6px -1px rgb(var(--shadow) / 0.10), 0 1px 2px -1px rgb(var(--shadow) / 0.08)",
        lg: "0 8px 24px -6px rgb(var(--shadow) / 0.16), 0 2px 6px -2px rgb(var(--shadow) / 0.10)",
        pop: "0 12px 40px -8px rgb(var(--shadow) / 0.24), 0 4px 10px -4px rgb(var(--shadow) / 0.14)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "translateY(4px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.25s ease-out",
        "scale-in": "scale-in 0.16s ease-out",
        "slide-in-right": "slide-in-right 0.24s cubic-bezier(0.16,1,0.3,1)",
        "caret-blink": "caret-blink 1.2s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
