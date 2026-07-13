/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        travel: {
          50: '#f0f7ff', 100: '#e0effe', 200: '#b9defe',
          300: '#7cd0fd', 400: '#38bdf8', 500: '#0ea5e9',
          600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#0c142c'
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
