import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#0d0c18',
          900: '#18162a',
          800: '#211e38',
          700: '#2c2a45',
          600: '#32305a',
          500: '#3a3660',
        },
      },
    },
  },
  plugins: [],
};

export default config;
