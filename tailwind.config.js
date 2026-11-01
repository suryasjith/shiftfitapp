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
        // Warm Off-White / Alabaster Editorial Canvas
        alabaster: {
          50: '#FDFCFB',
          100: '#FBF9F5',
          200: '#F5F2EB',
          300: '#EBE6DC',
          400: '#DED7C9',
          500: '#C7BDB0',
        },
        // Warm Sand & Terracotta Primary Palette (Wellness & Active Training)
        terracotta: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#EA580C',
          600: '#C2410C',
          700: '#9A3412',
          DEFAULT: '#C2410C',
        },
        // Forest Sage (Nutrition & Vitality)
        sage: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          DEFAULT: '#15803D',
        },
        // Ocean Mist / Cerulean (Hydration)
        ocean: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0284C7',
          600: '#0369A1',
          DEFAULT: '#0284C7',
        },
        // Warm Charcoal / Plum Slate (Progress & Deep Accents)
        charcoal: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#0A0F1D',
          DEFAULT: '#1C1917',
        },
        // Warm Stone Neutrals for Cards, Borders and Text
        stone: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        },
        // Zone-Specific Vibrancy Accents
        workout: {
          light: '#FFEDD5',
          DEFAULT: '#C2410C',
          coral: '#EA580C',
          dark: '#9A3412',
        },
        fuel: {
          light: '#DCFCE7',
          DEFAULT: '#15803D',
          mint: '#16A34A',
          dark: '#14532D',
        },
        hydration: {
          light: '#E0F2FE',
          DEFAULT: '#0284C7',
          blue: '#0369A1',
          dark: '#075985',
        },
        progress: {
          light: '#F3E8FF',
          DEFAULT: '#7E22CE',
          indigo: '#6B21A8',
          dark: '#581C87',
        }
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace']
      },
      borderWidth: {
        'hairline': '0.5px'
      }
    },
  },
  plugins: [],
}
