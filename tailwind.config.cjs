/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ledger: {
          bg: "#181715", // Warm charcoal logbook background
          card: "#24221f", // Logbook page or column card background
          border: "#3d3933", // Brass/warm dark border
          accent: "#d4af37", // Brass/gold accent
          "accent-hover": "#bfa032", // Slightly darker brass for hover
          text: "#eae9e6", // Chalk-white main text
          muted: "#a19b93", // Muted pencil/ink color for less prominent text
        }
      },
      fontFamily: {
        heading: ["Oswald", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
}
