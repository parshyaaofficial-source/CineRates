/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B0D12',
          900: '#12151C',
          850: '#161A23',
          800: '#1A1F2B',
          700: '#222838',
          600: '#2B3142',
        },
        brand: {
          violet: '#7C5CFF',
          cyan: '#22D3EE',
        },
        gold: {
          DEFAULT: '#F5C518',
          soft: '#FFD84D',
          dim: '#C9A534',
        },
        accent: {
          teal: '#2DD4BF',
          rose: '#FB7185',
          emerald: '#34D399',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        hero: ['Bebas Neue', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(124, 92, 255, 0.45)',
        'glow-cyan': '0 0 24px -4px rgba(34, 211, 238, 0.4)',
        card: '0 8px 30px -8px rgba(0,0,0,0.6)',
        'card-hover': '0 20px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7C5CFF 0%, #22D3EE 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(124,92,255,0.15) 0%, rgba(34,211,238,0.12) 100%)',
        'hero-fade': 'linear-gradient(180deg, rgba(11,13,18,0) 0%, rgba(11,13,18,0.5) 50%, rgba(11,13,18,0.95) 100%)',
        'hero-fade-left': 'linear-gradient(90deg, rgba(11,13,18,0.92) 0%, rgba(11,13,18,0.6) 40%, rgba(11,13,18,0) 100%)',
        'shimmer': 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1) translate(0,0)' },
          '100%': { transform: 'scale(1.12) translate(-2%, -1%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'progress-bar': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'ken-burns': 'ken-burns 18s ease-out infinite alternate',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'progress-bar': 'progress-bar linear forwards',
        'slide-down': 'slide-down 0.25s ease-out forwards',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
