/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: '#A855F7',
        'primary-dark': '#7C3AED',
        'primary-light': '#C084FC',
        secondary: '#EC4899',
        'secondary-light': '#F472B6',

        // Neon accents
        'neon-cyan': '#00E5FF',
        'neon-green': '#00FF88',
        'neon-yellow': '#FFEE00',

        // Backgrounds (dark)
        background: '#0A0A0F',
        surface: '#16161F',
        'surface-elevated': '#1F1F2B',
        'surface-hover': '#2A2A38',

        // Text
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0B8',
        'text-muted': '#6B7280',

        // Borders
        border: '#2A2A38',
        'border-light': '#1F1F2B',

        // Status
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
