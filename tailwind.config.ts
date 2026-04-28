import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0e0f10",
        panel: "#16181a",
        panel2: "#1c1f22",
        border: "#26292d",
        ink: "#e6e6e3",
        muted: "#8b8f95",
        faint: "#5b6066",
        accent: "#e9b44c",
        accentDim: "#7a5d27",
        easy: "#7fb685",
        medium: "#d8a657",
        hard: "#d76b6b",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
export default config;
