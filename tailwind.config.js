/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1A3A6B',
        blue: { brand: '#1D6FBE' },
        cyan: { brand: '#06B6D4' },
        ice: '#EFF6FF',
        mist: '#F0F7FF',
        pink: { 100: '#FFD9E8', 200: '#FFC2DC', 300: '#FFABD0' },
        purple: { 100: '#EBD6FF', 200: '#DCBFFF', 300: '#CDA8FF' },
        accent: { 1: '#FFB84D', 2: '#6AD1FF' }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'],
        display: ['Poppins', 'Inter', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        card: '0 8px 32px rgba(26, 58, 107, 0.10)',
        glow: '0 0 24px rgba(255, 184, 77, 0.35)'
      }
    }
  },
  plugins: []
}
