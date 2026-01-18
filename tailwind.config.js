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
        'primary': '#135bec',
        'royal-blue': '#0052cc',
        'vibrant-blue': '#0047FF',
        'sky-blue': '#00b4d8',
        'soft-navy': '#1e3a8a',
        'navy-vibrant': '#1e3a8a',
        'accent-blue': '#00D1FF',
        'deep-blue': '#0A2463',
        'gold': '#D4AF37',
        'prestige-gold': '#D4AF37',
        'vibrant-cyan': '#00F0FF',
        'soft-cyan': '#E0F7FA',
        'corporate-navy': '#0a1128',
      },
      fontFamily: {
        'display': ['Manrope', 'sans-serif'],
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
