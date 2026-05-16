/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3454D0',
        'primary-dark': '#2440A8',
        'primary-light': '#4D6BE8',
        sidebar: '#1E2D6E',
      },
    },
  },
  plugins: [],
}
