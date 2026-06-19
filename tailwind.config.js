/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        blood: { 50: '#fde8e8', 100: '#f8b4b4', 200: '#f17979', 300: '#e63e3e', 400: '#c62828', 500: '#8b1a1a', 600: '#6d1414', 700: '#500e0e', 800: '#360808', 900: '#1e0404' },
        gold: { 50: '#fef9e7', 100: '#fceabb', 200: '#f5d76e', 300: '#e8c539', 400: '#d4a816', 500: '#c9a84c', 600: '#a8872e', 700: '#876820', 800: '#654b16', 900: '#44310e' },
        bone: { 50: '#f5f0e8', 100: '#e8e0d0', 200: '#d4c8b0', 300: '#bfb094', 400: '#a89878', 500: '#8e7e60', 600: '#74644a', 700: '#5a4e38', 800: '#403828', 900: '#2a2418' },
        abyss: { 50: '#1a1a2e', 100: '#16162a', 200: '#121226', 300: '#0e0e22', 400: '#0a0a1e', 500: '#0a0a0f', 600: '#08080c', 700: '#060608', 800: '#040404', 900: '#020202' },
        mystic: { 50: '#8b5cf6', 100: '#7c3aed', 200: '#6d28d9', 300: '#5b21b6', 400: '#4a1a6b', 500: '#3b1578', 600: '#2e1058', 700: '#220c42', 800: '#18082c', 900: '#0e0416' },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(201, 168, 76, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(201, 168, 76, 0.4)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
