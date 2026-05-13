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
        'brand-blue': '#1D4ED8', // Escurecido de leve (era #5EA2FF, depois #2E66F6, agora um azul real profundo)
        'brand-blue-secondary': '#4A87DF',
        'brand-blue-hover': '#1E40AF',
        'brand-blue-light': '#DCEEFF',
        'brand-dark': '#0F172A',
        'brand-gray': '#E2E8F0',
        'brand-text-secondary': '#475569',
        'bg-main': '#F7FAFF',
        
        // Cores antigas provisórias para não quebrar outros componentes imediatamente
        'brand-white': '#FFFFFF',
        'logo-bg': '#000d2c',
        'navy-deep': '#051139',
        'navy-light': '#0a1645',
        'gold': '#D4AF37',
        'prestige-gold': '#D4AF37',
        'primary': '#5EA2FF', 
        'accent': '#00C2FF',
      },
      fontFamily: {
        'display': ['Plus Jakarta Sans', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Plus Jakarta Sans', 'sans-serif'],
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
