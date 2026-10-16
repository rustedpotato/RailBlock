/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          dark: '#0B132B',
          navy: '#1C2541',
          blue: '#3A506B',
          teal: '#5BC0BE',
          accent: '#FF7F11',
          gold: '#FFD166',
        }
      }
    },
  },
  plugins: [],
}
