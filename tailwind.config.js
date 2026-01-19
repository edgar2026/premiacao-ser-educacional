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
        'logo-bg': '#000d2c',
        'navy-deep': '#051139',
        'navy-light': '#0a1645',
        'gold': '#D4AF37',
        'prestige-gold': '#D4AF37',
        'primary': '#D4AF37', // Using gold as primary for a prestige look
        'accent': '#F7E7CE',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1.25rem',
        '3xl': '2rem',
        'full': '9999px'
      },
    },
  },
  plugins: [],
}
