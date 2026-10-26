import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-montserrat)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Paleta oficial BR Instalacoes: azul principal #0066FF, preto grafite #0F172A
        // (= slate-900 do Tailwind) e branco #F8FAFC (= slate-50 do Tailwind).
        primary: {
          50: "#eff6ff",
          100: "#dbeaff",
          200: "#bdd8ff",
          300: "#8ebcff",
          400: "#5296ff",
          500: "#2171ff",
          600: "#0066ff",
          700: "#0052cc",
          800: "#0041a3",
          900: "#073380",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        popover: "0 4px 6px -1px rgb(15 23 42 / 0.08), 0 10px 20px -4px rgb(15 23 42 / 0.08)",
      },
      borderRadius: {
        lg: "0.625rem",
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
