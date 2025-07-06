/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Dark theme colors from mockup
        'bg-primary': '#0F1419',
        'bg-secondary': '#1A1F26',
        'bg-tertiary': '#242B33',
        'bg-quaternary': '#2D3440',
        'text-primary': '#F7F9FA',
        'text-secondary': '#D1D9E0',
        'text-tertiary': '#8B949E',
        'text-muted': '#6E7681',
        'border-primary': '#30363D',
        'border-secondary': '#3A4046',
        'primary': '#16C181',
        'primary-hover': '#10A574',
        'primary-muted': '#16C18120',
        'accent': '#8B5CF6',
        'accent-hover': '#7C3AED',
        'accent-muted': '#8B5CF620',
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6'
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'touch': '44px',
        'touch-comfortable': '48px',
        'touch-large': '56px'
      }
    },
  },
  plugins: [],
}