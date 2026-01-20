/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#0a0a0a',
        },
      },
    },
  },
  plugins: [],
};


