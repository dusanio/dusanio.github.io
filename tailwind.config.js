/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        dark: "#17181c",
        purpleish: "#B08BFF",
        grayish: "#9ba5c9",
      },
      fontFamily: {
        inter: ["inter", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
};
