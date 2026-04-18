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
          500: '#2B6CB0',
          600: '#1F525D',
          700: '#003D4D',
          800: '#001F2B',
        },
        // Status colors
        'success': '#38A169',
        'warning': '#D69E2E',
        'danger': '#E53E3E',
        'info': '#3B82F6',
      },
      fontFamily: {
        'sans': ['Inter', 'Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in',
        'slideUp': 'slideUp 0.3s ease-out',
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
      },
    },
  },
  plugins: [],
}