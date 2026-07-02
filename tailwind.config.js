/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.25s ease-out',
      },
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
