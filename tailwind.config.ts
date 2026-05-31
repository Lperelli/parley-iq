import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body:    ['Outfit', 'sans-serif'],
        data:    ['JetBrains Mono', 'monospace'],
        // keep legacy aliases
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: '#070a10',
        accent: {
          DEFAULT: '#a3fb5a',
          dim:     'rgba(163, 251, 90, 0.12)',
        },
        navy: {
          950: '#04060b',
          900: '#070a10',
          800: '#0b0f17',
          700: '#101620',
        },
        surface: {
          1: 'rgba(255, 255, 255, 0.028)',
          2: 'rgba(255, 255, 255, 0.05)',
        },
      },
      borderColor: {
        DEFAULT: 'rgba(255, 255, 255, 0.06)',
        hover:   'rgba(255, 255, 255, 0.10)',
      },
      animation: {
        'pulse-slow':  'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':     'fadeIn 0.35s ease-out forwards',
        'slide-up':    'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
