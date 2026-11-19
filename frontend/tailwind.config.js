/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F4EEE5',
          300: '#ECE2D3',
          400: '#DECDBD',
          500: '#C7B49F',
        },
        surface: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F4EEE5',
          300: '#ECE2D3',
          400: '#DECDBD',
        },
        orange: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        charcoal: {
          900: '#1C1917',
          800: '#292524',
          700: '#44403C',
          600: '#57534E',
          500: '#78716C',
          400: '#A8A29E',
        },
        category: {
          rumah: '#10B981',
          'rumah-dark': '#059669',
          'rumah-light': '#ECFDF5',
          kost: '#3B82F6',
          'kost-dark': '#2563EB',
          'kost-light': '#EFF6FF',
          kontrakan: '#F97316',
          'kontrakan-dark': '#EA580C',
          'kontrakan-light': '#FFF7ED',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(124, 45, 18, 0.05), 0 4px 6px -4px rgba(124, 45, 18, 0.03)',
        'card': '0 4px 25px 0 rgba(41, 37, 36, 0.06)',
        'float': '0 10px 30px -5px rgba(234, 88, 12, 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
