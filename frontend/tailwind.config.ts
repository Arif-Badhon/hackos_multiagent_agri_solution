import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ondera: {
          dark: "#051A11",
          card: "#0A281B",
          cardBorder: "#13422E",
          emerald: "#10B981",
          forest: "#0F382A",
          leaf: "#22C55E",
          amber: "#F59E0B",
          ochre: "#D97706",
          parchment: "#F8F5EE",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
