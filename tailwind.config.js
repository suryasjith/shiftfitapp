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
        // Dark Slate Navy Base (#0B132B)
        navy: {
          950: '#060B1A',
          900: '#0B132B',
          850: '#111D42',
          800: '#1C2541',
          700: '#3A506B',
        },
        // Electric Mint & Soft Violet Palette
        mint: {
          400: '#33FFA0',
          DEFAULT: '#00FF87',
          500: '#00FF87',
          600: '#00CC6C',
        },
        violet: {
          400: '#A354F5',
          DEFAULT: '#8A2BE2',
          500: '#8A2BE2',
          600: '#6E1CB8',
        },
        // Soft Dark Slate Base (Eliminates OLED Halation & Eye Strain)
        slate: {
          950: '#0B1120',
          900: '#0F172A',
          850: '#162036',
          800: '#1E293B',
          750: '#28354D',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        // Mapped neutral to soft slate/charcoal scale
        neutral: {
          950: '#0B1120',
          900: '#0F172A',
          850: '#162036',
          800: '#1E293B',
          750: '#28354D',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        // Zone-Specific Vibrancy Accents
        workout: {
          light: '#FDE68A',
          DEFAULT: '#F59E0B',
          coral: '#F97316',
          dark: '#B45309',
        },
        fuel: {
          light: '#A7F3D0',
          DEFAULT: '#14B8A6',
          mint: '#10B981',
          dark: '#0F766E',
        },
        hydration: {
          light: '#BAE6FD',
          DEFAULT: '#0EA5E9',
          blue: '#3B82F6',
          dark: '#0369A1',
        },
        progress: {
          light: '#DDD6FE',
          DEFAULT: '#A855F7',
          indigo: '#6366F1',
          dark: '#7E22CE',
        }
      },
      fontFamily: {
        heading: ['Space Grotesk', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['Space Grotesk', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Display', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'Monaco', 'monospace']
      },
      borderWidth: {
        'hairline': '0.5px'
      }
    },
  },
  plugins: [],
}
