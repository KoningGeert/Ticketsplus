/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}", "./src/pages/*"],
  theme: {
    extend: {
      colors: {
        blauw: '#0097A2',
        oranje: '#EC6F02',
        grijs: '#E5E4E2',
        achtergrond: '#FFFAE9',
        zwart: '#0B1215',
        groen: '#5AA423',
      },
    },
  },
  plugins: [
  ],
}