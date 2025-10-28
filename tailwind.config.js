/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '2000px', // Ultra-wide displays (55" 4K monitors)
      },
      fontFamily: {
        'heading': ['Bebas Neue', 'sans-serif'],      // Bold, chunky all-caps headers
        'script': ['Pacifico', 'cursive'],            // Stylish script/handwritten
        'display': ['Righteous', 'cursive'],          // Eye-catching display font
        'marker': ['Permanent Marker', 'cursive'],    // Casual marker style
        'handwritten': ['Kalam', 'cursive'],          // Handwritten look
        'body': ['Poppins', 'sans-serif'],            // Clean body text
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

