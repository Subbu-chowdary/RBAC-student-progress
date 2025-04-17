/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        themecolor: {
          50: "#EEEEEE", // Slightly darker lightest shade
          100: "#DBE9FA",
          200: "#C2D6FF",
          300: "#A8C7FF",
          400: "#8EB8FF",
          500: "#74A9FF",
          600: "#4A8CFF", // Darker for sidebar background
          700: "#1F6FFF",
          800: "#0049B8", // Kept for buttons or accents
          900: "#002F7A", // Darker for card backgrounds
          950: "#001A45", // Darkest for deep backgrounds
          120: "#000000",
          125: "#111827",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        display: ["Roboto", "sans-serif"],
      },
      spacing: {
        14: "3.5rem",
        96: "24rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 0 10px rgba(0, 0, 0, 0.2)", // Even shadow on all sides
      },
    },
  },
  plugins: [],
};
