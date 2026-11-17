/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'sans-serif'],
      },
      colors: {
        lab: {
          dark: '#060d18',
          panel: '#0d1b2e',
          border: '#1e3a5f',
          cyan: '#06b6d4',
          emerald: '#10b981',
          crimson: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
