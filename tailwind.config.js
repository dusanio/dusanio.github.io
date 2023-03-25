/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './node_modules/flowbite/**/*.js'],
  theme: {
    extend: {
      colors: {
        dark: '#17181c',
        purpleish: '#B08BFF',
        grayish: '#9ba5c9',
        primary: '#4ade80',
      },
      fontFamily: {
        inter: ['inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui', 'flowbite/plugin')],
}
