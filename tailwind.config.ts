import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'lives-green': '#22c55e',
        'lives-yellow': '#eab308',
        'lives-red': '#ef4444',
        'card-disabled': '#9ca3af',
      },
    },
  },
  plugins: [],
};

export default config;
