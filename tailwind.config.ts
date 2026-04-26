import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-orbitron)", "system-ui", "sans-serif"],
      },
      colors: {
        cyber: {
          obsidian: "#0B0B0B",
          gunmetal: "#2C3E50",
          crimson: "#8B0000",
          accent: "#DC143C",
          steel: "#4A5568",
          shadow: "#1A202C",
        },
        // Keep neon for backward compatibility but with muted versions
        neon: {
          cyan: "#1E90FF",
          pink: "#DC143C",
          purple: "#4B0082",
          yellow: "#FFD700",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(220, 20, 60, 0.5), 0 0 20px rgba(220, 20, 60, 0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(220, 20, 60, 0.8), 0 0 40px rgba(220, 20, 60, 0.5)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}

export default config
