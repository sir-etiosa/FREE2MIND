import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F8FE",
        surface: "#FFFFFF",
        line: "#E4E7F4",
        ink: "#161A33",
        muted: "#6A6F94",
        sky: {
          DEFAULT: "#2F6BF6",
          soft: "#E8F0FE",
          deep: "#1E4FD0",
        },
        nebula: {
          DEFAULT: "#6B46E5",
          soft: "#EEE9FD",
          deep: "#5532C7",
        },
        positive: "#0F9D77",
        flag: "#C77816",
        danger: "#D6504D",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(22,26,51,0.04), 0 4px 16px rgba(22,26,51,0.04)",
        lift: "0 8px 30px rgba(43,49,107,0.12)",
      },
      backgroundImage: {
        nebula: "linear-gradient(120deg, #2F6BF6 0%, #5B4AE8 55%, #7C4DE8 100%)",
        "nebula-soft": "linear-gradient(120deg, #E8F0FE 0%, #EEE9FD 100%)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};
export default config;
