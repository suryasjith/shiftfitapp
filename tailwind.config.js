/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // True Black & OLED Grayscale
        black: '#000000',
        neutral: {
          950: '#050505',
          900: '#0a0a0a',
          850: '#121212',
          800: '#1a1a1a',
          750: '#222222',
          700: '#2c2c2c',
          600: '#404040',
          500: '#525252',
          400: '#737373',
          300: '#a3a3a3',
          200: '#d4d4d4',
          100: '#f5f5f5',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace']
      },
      borderWidth: {
        'hairline': '0.5px'
      }
    },
  },
  plugins: [],
}
