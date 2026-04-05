/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        chart: {
          1: '#22c55e',
          2: '#3b82f6',
          3: '#f59e0b',
          4: '#ef4444',
          5: '#8b5cf6',
          6: '#06b6d4',
          7: '#f97316',
          8: '#ec4899',
        },
      },
    },
  },
  plugins: [],
}
