/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#0a0e27',
          800: '#1a1f3a',
          700: '#2a2f45',
          600: '#3a3f55',
          500: '#4a4f65',
          400: '#5a5f75',
          300: '#8b92b1',
          200: '#a3aac0',
          100: '#c9d1e0',
        },
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}