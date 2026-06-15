import type { Config } from "tailwindcss";

const config: Config = {
  content: {
    relative: true,
    files: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./lib/**/*.{js,ts,jsx,tsx,mdx}"
    ]
  },
  theme: {
    extend: {
      colors: {
        ink: "#10202f",
        harbor: "#12394a",
        tide: "#1c6b73",
        glass: "#83c8bf",
        signal: "#f2bf4b",
        coral: "#ef7c67",
        mist: "#f5f7f4",
        foam: "#fbfcf8",
        steel: "#738191"
      },
      boxShadow: {
        soft: "0 22px 70px rgba(16, 32, 47, 0.14)",
        glow: "0 18px 60px rgba(28, 107, 115, 0.22)"
      },
      backgroundImage: {
        "chart-grid":
          "linear-gradient(rgba(18, 57, 74, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(18, 57, 74, 0.07) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
