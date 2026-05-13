/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mint: {
          DEFAULT: '#81C784',
          soft: '#E8F5E9',
          light: '#F1F8F2',
        },
        bg: '#F8F6F0',
        text: {
          primary: '#333333',
          secondary: '#666666',
          tertiary: '#999999',
        },
        green: {
          DEFAULT: '#81C784',
          bg: '#E8F5E9',
        },
        yellow: {
          DEFAULT: '#FFB74D',
          bg: '#FFF3E0',
        },
        red: {
          DEFAULT: '#FFAB91',
          bg: '#FFF0EB',
        },
        border: '#E8E5DF',
      },
      borderRadius: {
        'card': '16px',
        'btn': '20px',
        'modal': '20px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
