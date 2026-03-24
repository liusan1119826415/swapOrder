import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#131313",
        foreground: "#e5e2e1",
        primary: {
          DEFAULT: "#ddb7ff",
          container: "#b76dff",
          fixed: "#f0dbff",
          "fixed-dim": "#ddb7ff",
        },
        "on-primary": "#490080",
        "on-primary-container": "#400071",
        "on-primary-fixed": "#2c0051",
        "on-primary-fixed-variant": "#6900b3",
        secondary: {
          DEFAULT: "#a6e6ff",
          container: "#14d1ff",
          fixed: "#b7eaff",
          "fixed-dim": "#4cd6ff",
        },
        "on-secondary": "#003543",
        "on-secondary-container": "#00566b",
        "on-secondary-fixed": "#001f28",
        "on-secondary-fixed-variant": "#004e60",
        tertiary: {
          DEFAULT: "#aec6ff",
          container: "#508eff",
          fixed: "#d8e2ff",
          "fixed-dim": "#aec6ff",
        },
        "on-tertiary": "#002e6b",
        "on-tertiary-container": "#00275e",
        "on-tertiary-fixed": "#001a43",
        "on-tertiary-fixed-variant": "#004397",
        surface: {
          DEFAULT: "#131313",
          dim: "#131313",
          bright: "#3a3939",
          variant: "#353534",
          tint: "#ddb7ff",
          container: {
            DEFAULT: "#201f1f",
            low: "#1c1b1b",
            high: "#2a2a2a",
            highest: "#353534",
            lowest: "#0e0e0e",
          },
        },
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#cfc2d6",
        outline: {
          DEFAULT: "#988d9f",
          variant: "#4d4354",
        },
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
        },
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
        "inverse-primary": "#842bd2",
        "inverse-surface": "#e5e2e1",
        "inverse-on-surface": "#313030",
      },
      fontFamily: {
        headline: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        label: ["var(--font-space-grotesk)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(221, 183, 255, 0.4)",
        "glow-sm": "0 0 15px rgba(221, 183, 255, 0.3)",
        "glow-secondary": "0 0 12px rgba(20, 209, 255, 0.4)",
      },
      backdropBlur: {
        glass: "20px",
      },
    },
  },
  plugins: [],
};
export default config;
