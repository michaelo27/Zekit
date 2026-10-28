import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        zk: {
          bg: "#070A12",
          surface: "#0D1324",
          surface2: "#121B33",
          text: "#EAF0FF",
          muted: "#A9B4D0",
          cyan: "#22D3EE",
          violet: "#8B5CF6",
          lime: "#A3E635",
          danger: "#FB7185",
          border: "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        glow: "0 0 36px -8px rgba(34, 211, 238, 0.25)",
        violetGlow: "0 0 36px -8px rgba(139, 92, 246, 0.28)",
      },
      backgroundImage: {
        "zk-hero-radial":
          "radial-gradient(ellipse 80% 50% at 50% -15%, rgba(34, 211, 238, 0.14), rgba(139, 92, 246, 0.08) 45%, transparent 75%)",
        "zk-card-gradient":
          "linear-gradient(180deg, rgba(18, 27, 51, 0.65) 0%, rgba(13, 19, 36, 0.92) 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
