/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        dark: "#17181c",
        redish: "#fa4753",
        grayish: "#9ba5c9",
      },
      fontFamily: {
        inter: ["inter", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
};
