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
        mono:    ['DM Mono', 'monospace'],
        data:    ['DM Mono', 'monospace'],
      },
      colors: {
        bg: '#08090d',
        accent: {
          DEFAULT: '#c6f24e',
          soft:    '#d6f97a',
          dim:     'rgba(198, 242, 78, 0.12)',
        },
        navy: {
          950: '#05060a',
          900: '#08090d',
          800: '#0c0e14',
          700: '#11141c',
        },
        surface: {
          1: 'rgba(255, 255, 255, 0.026)',
          2: 'rgba(255, 255, 255, 0.05)',
          3: 'rgba(255, 255, 255, 0.08)',
        },
      },
      borderColor: {
        DEFAULT: 'rgba(255, 255, 255, 0.06)',
        hover:   'rgba(255, 255, 255, 0.10)',
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.35s ease-out forwards',
        'slide-up':   'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
