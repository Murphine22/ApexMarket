/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Psychological palette from the product plan
        safe: {
          // "Safe Green" — trust & stability
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        navy: {
          // "Deep Navy" — professional reliability
          800: '#101a33',
          900: '#0b1220',
          950: '#070b16',
        },
        amber: {
          // "Warm Amber" — proactive urgency
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(16,185,129,0.25), 0 8px 40px -8px rgba(16,185,129,0.35)',
        'glow-amber': '0 0 0 1px rgba(245,158,11,0.3), 0 8px 40px -8px rgba(245,158,11,0.45)',
        glass: '0 8px 32px 0 rgba(0,0,0,0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,158,11,0.5)' },
          '50%': { boxShadow: '0 0 0 8px rgba(245,158,11,0)' },
        },
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(16,185,129,0.6), 0 0 18px rgba(16,185,129,0.35)' },
          '50%': { boxShadow: '0 0 0 1px rgba(16,185,129,0.9), 0 0 34px rgba(16,185,129,0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite',
        'pulse-neon': 'pulse-neon 2.2s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
