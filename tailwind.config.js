/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        coal: {
          950: '#080b0e',
          900: '#0d1217',
          850: '#121922',
          800: '#18212b',
        },
        signal: {
          500: '#3dd6a3',
          600: '#24b98a',
        },
        amberline: '#d8a84f',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 24px 80px rgba(0, 0, 0, 0.32)',
      },
    },
  },
  plugins: [],
};
