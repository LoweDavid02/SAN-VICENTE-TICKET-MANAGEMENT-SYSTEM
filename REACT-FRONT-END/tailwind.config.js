/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Navy Blue - Primary color for government authority
        'navy': {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#B2C5DB',
          300: '#8BA7C9',
          400: '#648AB8',
          500: '#3D6DA7',
          600: '#2B5394',
          700: '#1A365D',
          800: '#0F1E3C',
          900: '#07101F',
        },
        // Clean Teal - Secondary for actions and highlights
        'teal': {
          50: '#E8F5F9',
          100: '#B3D9E1',
          200: '#7AC3D1',
          300: '#42ADC0',
          400: '#2B97AD',
          500: '#0D9488',
          600: '#1F525D',
          700: '#003D4D',
          800: '#001F2B',
        },
        // Primary Blue (for buttons and CTAs)
        'primary': {
          DEFAULT: '#0058be',
          dark: '#004a9f',
          light: '#3B82F6',
        },
        // Status colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'info': '#3B82F6',
      },
      fontFamily: {
        'sans': ['Inter', 'Roboto', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Mono', 'Cascadia Code', 'monospace'],
        'display': ['Public Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'button': '0 2px 4px rgba(0, 88, 190, 0.2)',
        'button-hover': '0 4px 8px rgba(0, 88, 190, 0.3)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in',
        'slideUp': 'slideUp 0.3s ease-out',
        'scaleIn': 'scaleIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
