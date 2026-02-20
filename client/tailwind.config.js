/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,svelte}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(240 253 250)',
          100: 'rgb(204 251 241)',
          200: 'rgb(153 246 228)',
          300: 'rgb(94 234 212)',
          400: 'rgb(45 212 191)',
          500: 'rgb(20 184 166)',
          600: 'rgb(13 148 136)',
          700: 'rgb(15 118 110)',
          800: 'rgb(17 94 89)',
          900: 'rgb(19 78 74)',
        },
        accent: {
          50: 'rgb(254 252 232)',
          100: 'rgb(254 249 195)',
          200: 'rgb(254 240 138)',
          300: 'rgb(253 224 71)',
          400: 'rgb(251 191 36)',
          500: 'rgb(245 158 11)',
          600: 'rgb(217 119 6)',
          700: 'rgb(180 83 9)',
          800: 'rgb(146 64 14)',
          900: 'rgb(120 53 15)',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        arvo: ['Arvo', 'serif'],
        lexend: ['"Lexend Giga"', 'sans-serif'],
        luckiest: ['"Luckiest Guy"', 'cursive'],
        josefin: ['"Josefin Sans"', 'sans-serif'],
        bangers: ['Bangers', 'cursive'],
        satisfy: ['Satisfy', 'cursive'],
        vt323: ['VT323', 'monospace'],
        staatliches: ['Staatliches', 'cursive'],
        cinzel: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
};
