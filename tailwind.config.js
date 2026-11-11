/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teut: {
          green: '#5db130',
          greenDark: '#2f6b17',
          greenDeep: '#0d2a0a',
          orange: '#f08d24',
          orangeDark: '#c4650b',
          cream: '#fff7e8',
        },
      },
      fontFamily: {
        display: ['"Lilita One"', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(240,141,36,.55), 0 0 80px rgba(93,177,48,.35)',
      },
    },
  },
  plugins: [],
};
