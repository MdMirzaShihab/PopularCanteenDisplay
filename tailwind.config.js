/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Font classes applied dynamically in gallery renderers
    'font-heading', 'font-display', 'font-script', 'font-marker', 'font-handwritten', 'font-body',
    'font-oswald', 'font-anton', 'font-fjalla', 'font-alfa', 'font-yeseva', 'font-abril',
    'font-playfair', 'font-cinzel', 'font-cormorant', 'font-lora', 'font-merriweather',
    'font-montserrat', 'font-raleway', 'font-lato', 'font-dancing', 'font-lobster',
    // Size classes from typographyRegistry (static + 3xl: responsive variants)
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
    'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl',
    '3xl:text-3xl', '3xl:text-4xl', '3xl:text-5xl', '3xl:text-6xl', '3xl:text-7xl',
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '2000px', // Ultra-wide displays (55" 4K monitors)
      },
      fontFamily: {
        // Originals
        'heading':      ['Bebas Neue', 'sans-serif'],
        'display':      ['Righteous', 'cursive'],
        'script':       ['Pacifico', 'cursive'],
        'marker':       ['Permanent Marker', 'cursive'],
        'handwritten':  ['Kalam', 'cursive'],
        'body':         ['Poppins', 'sans-serif'],
        // Condensed display
        'oswald':       ['Oswald', 'sans-serif'],
        'anton':        ['Anton', 'sans-serif'],
        'fjalla':       ['Fjalla One', 'sans-serif'],
        // Slab / impact display
        'alfa':         ['Alfa Slab One', 'serif'],
        'yeseva':       ['Yeseva One', 'serif'],
        'abril':        ['Abril Fatface', 'serif'],
        // Editorial / readable serif
        'playfair':     ['Playfair Display', 'serif'],
        'cinzel':       ['Cinzel', 'serif'],
        'cormorant':    ['Cormorant Garamond', 'serif'],
        'lora':         ['Lora', 'serif'],
        'merriweather': ['Merriweather', 'serif'],
        // Clean sans
        'montserrat':   ['Montserrat', 'sans-serif'],
        'raleway':      ['Raleway', 'sans-serif'],
        'lato':         ['Lato', 'sans-serif'],
        // Script
        'dancing':      ['Dancing Script', 'cursive'],
        'lobster':      ['Lobster', 'cursive'],
      },
      colors: {
        white: '#FFFFFF',
        primary: {
          50: '#f5f6f3',   // Very light green for subtle backgrounds
          100: '#8F9779',   // Main green
          200: '#737b5e',   // Darker green for hover
          300: '#373f25',   // Darkest green
          600: '#8F9779',   // Alias for compatibility
          700: '#737b5e',   // Alias for compatibility
        },
        accent: {
          100: '#FFB6B9',   // Light pink
          200: '#98585c',   // Dark pink/rose
          300: '#7a464a',   // Darker pink for hover
        },
        text: {
          100: '#4D4D4D',   // Primary dark gray text
          200: '#797979',   // Secondary medium gray text
          300: '#a8a8a8',   // Tertiary light gray text
        },
        bg: {
          100: '#F2EFE9',   // Cream background
          200: '#e8e5df',   // Darker cream
          300: '#bfbdb7',   // Border gray
        },
      },
    },
  },
  plugins: [],
}

