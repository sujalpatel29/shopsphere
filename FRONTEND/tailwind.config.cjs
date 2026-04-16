module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Primary accent - Teal
        teal: {
          50: "#e6f7f5",
          100: "#b3ebe4",
          200: "#80dfd3",
          300: "#4dd3c2",
          400: "#26c9b4",
          500: "#1A9E8E",
          600: "#168c7e",
          700: "#117a6e",
          800: "#0d685e",
          900: "#08564e",
        },
        // Brand colors - warm cream theme
        brand: {
          50: "#F6F3EE",
          100: "#F0EBE3",
          200: "#E8E3DA",
          300: "#DDD8CF",
          400: "#A8A39A",
          500: "#7C7670",
          600: "#5A5550",
          700: "#3D3A37",
          800: "#132420",
          900: "#0a1614",
          accent: "#1A9E8E",
        },
        // App-specific backgrounds
        "app-background": {
          light: "#F6F3EE",
          dark: "#132420",
        },
        "app-surface": {
          light: "#FFFFFF",
          dark: "#1a2e28",
          darker: "#132420",
          border: "#2a3f38",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
        serif: ['"Plus Jakarta Sans"', "sans-serif"],
        accent: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      boxShadow: {
        luxe: "0 2px 6px rgba(0, 0, 0, 0.05)",
        card: "0 2px 6px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
