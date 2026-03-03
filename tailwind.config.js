/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fivem': {
          'primary': '#7028c4',
          'dark': '#0f172a',
          'darker': '#020617'
        },
        'primary': {
          300: '#a855f7',
          400: '#9333ea',
          500: '#7028c4',
          600: '#5b21b6',
        }
      }
    },
  },
  plugins: [],
}
