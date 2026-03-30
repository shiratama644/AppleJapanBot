import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          bg: '#1e1f22',
          card: '#2b2d31',
          'card-hover': '#36383d',
          sidebar: '#111214',
          text: '#dbdee1',
          muted: '#949ba4',
          border: '#3f4147',
          blurple: '#5865f2',
          'blurple-dark': '#4752c4',
          green: '#23a55a',
          red: '#f23f42',
        },
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        fadeIn: 'fadeIn 0.25s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
