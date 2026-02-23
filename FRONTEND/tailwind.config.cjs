module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        amber: {
          50: "#edf6f4",
          100: "#d6ebe7",
          200: "#add7cf",
          300: "#84c3b7",
          400: "#5caf9f",
          500: "#3f9788",
          600: "#2f7a6f",
          700: "#275f58",
          800: "#214d48",
          900: "#1d3f3b",
        },
      },
      fontFamily: {
        sans: ["Jost", "sans-serif"],
        serif: ['"Tenor Sans"', "sans-serif"],
        accent: ["Urbanist", "sans-serif"],
      },
      boxShadow: {
        luxe: "0 22px 45px -12px rgba(47, 122, 111, 0.22)",
      },
    },
  },
  plugins: [],
};
