/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3e63dd',
          dark:    '#2d4eb5',
          light:   '#eef2ff',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          950: '#1e0a3c',
        },
      },
      fontFamily: {
        sans: [
          'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
          'Helvetica Neue', 'sans-serif',
        ],
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':       { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-12px)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px 0px rgba(99,102,241,0.4)' },
          '50%':       { boxShadow: '0 0 40px 8px rgba(99,102,241,0.7)' },
        },
        'slide-down': {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'float':          'float 5s ease-in-out infinite',
        'fade-up':        'fade-up 0.6s ease-out forwards',
        'fade-up-delay':  'fade-up 0.6s ease-out 0.2s forwards',
        'fade-up-delay2': 'fade-up 0.6s ease-out 0.4s forwards',
        'pulse-glow':     'pulse-glow 2.5s ease-in-out infinite',
        'slide-down':     'slide-down 0.18s ease-out',
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
}
