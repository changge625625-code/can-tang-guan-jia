/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: '#E8927D',
          soft: '#FDF0EC',
          light: '#FCE8E3',
        },
        cream: '#FAFAF8',
        bg: '#F6F4F1',
        text: {
          primary: '#3C3C3A',
          secondary: '#8E8C88',
          tertiary: '#B5B3AF',
        },
        green: {
          DEFAULT: '#7EBF73',
          bg: '#F2FAF0',
        },
        yellow: {
          DEFAULT: '#E8C560',
          bg: '#FFFCF2',
        },
        red: {
          DEFAULT: '#E57373',
          bg: '#FFF4F4',
        },
        border: '#EDEBE7',
      },
      borderRadius: {
        'card': '16px',
        'btn': '24px',
        'modal': '28px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(60,60,58,0.06)',
        'card-md': '0 4px 16px rgba(60,60,58,0.08)',
        'card-lg': '0 8px 32px rgba(60,60,58,0.10)',
        'btn': '0 2px 8px rgba(255,126,103,0.25)',
      },
    },
  },
  plugins: [],
}
