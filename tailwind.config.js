/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Layered dark surfaces (page < card < elevated), not flat single-tone gray.
        surface: {
          DEFAULT: "#0a0a0d",
          card: "#141418",
          elevated: "#1c1c22",
          border: "#26262e",
          borderStrong: "#33333d",
        },
        // Muted text tuned for the surface tones above.
        ink: {
          DEFAULT: "#f2f2f5",
          muted: "#a1a1ac",
          faint: "#6f6f7a",
        },
        // Single accent hue used sparingly: primary actions, active states, links.
        accent: {
          DEFAULT: "#8b5cf6",
          hover: "#7c3aed",
          soft: "#221933",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
