import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        flipY: {
          '0%': {
            transform: 'rotateY(90deg)',
          },
          '100%': {
            transform: 'rotateY(0deg)',
          },
        },
      },
      animation: {
        'deal': 'fadeInUp 150ms ease-out',
        'flip': 'flipY 250ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config; 