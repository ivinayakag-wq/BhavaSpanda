import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#FDFBF9",
          soft: "#FFFFFF",
          deep: "#F5F0EB",
        },
        rose: {
          DEFAULT: "#EC671B",
          soft: "#F9A86C",
          subtle: "rgba(236, 103, 27, 0.08)",
        },
        gold: {
          DEFAULT: "#D4893B",
          soft: "#E8A87C",
          faint: "rgba(212, 137, 59, 0.08)",
        },
        ember: {
          DEFAULT: "#EC671B",
          soft: "rgba(236, 103, 27, 0.12)",
        },
        background: "#FDFBF9",
        surface: "#FFFFFF",
        foreground: "#2D2A24",
        muted: "#6B655A",
        accent: "#F9A86C",
        primary: "#EC671B",
        secondary: "#F9A86C",
        "text-primary": "#2D2A24",
        "text-secondary": "#6B655A",
        border: "#EDE8E0",
        shadow: "rgba(236, 103, 27, 0.08)",
      },
      fontFamily: {
        name: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"Inter"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ['"Playfair Display"', "Georgia", "serif"],
      },
      borderRadius: {
        pill: "999px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(236, 103, 27, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
