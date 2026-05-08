import { 
  colors, 
  typography, 
  spacing, 
  shadows, 
  animations, 
  borderRadius 
} from './src/theme/index.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Integrate centralized color system
      colors: {
        ...colors,
        // Legacy aliases for backward compatibility
        navy: colors.primary,
        teal: colors.secondary,
      },
      
      // Integrate typography system
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      letterSpacing: typography.letterSpacing,
      lineHeight: typography.lineHeight,
      
      // Integrate spacing system
      spacing,
      
      // Integrate shadow system
      boxShadow: shadows,
      
      // Integrate animation system
      animation: animations.animation,
      keyframes: animations.keyframes,
      transitionDuration: animations.transitionDuration,
      transitionTimingFunction: animations.transitionTimingFunction,
      
      // Integrate border radius system
      borderRadius,
      
      // Additional utilities
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
