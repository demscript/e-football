import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0057FF",
          "blue-light": "#3B82F6",
          "blue-dark": "#003FBD",
          yellow: "#FFD700",
          "yellow-light": "#FFF176",
          "yellow-dark": "#F59E0B",
        },
        dark: {
          900: "#050A14",
          800: "#0A1120",
          700: "#0F1A2E",
          600: "#162137",
          500: "#1E2D47",
          400: "#2A3F60",
          300: "#3D5A87",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-rajdhani)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-pattern":
          "radial-gradient(ellipse at 20% 50%, rgba(0,87,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,215,0,0.08) 0%, transparent 50%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "blue-glow":
          "radial-gradient(circle at center, rgba(0,87,255,0.3) 0%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 30px rgba(0, 87, 255, 0.3)",
        "glow-yellow": "0 0 30px rgba(255, 215, 0, 0.3)",
        "glow-sm": "0 0 15px rgba(0, 87, 255, 0.2)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        "gradient-x": "gradient-x 3s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundSize: "200% 200%", backgroundPosition: "left center" },
          "50%": { backgroundSize: "200% 200%", backgroundPosition: "right center" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
