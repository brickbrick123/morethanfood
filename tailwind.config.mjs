/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — warm, community-driven, food-forward
        forest: {
          DEFAULT: '#14492F', // deep brand green
          50: '#EEF4EF',
          100: '#D6E5DA',
          200: '#A9C9B2',
          300: '#7BAC8A',
          400: '#4E8F62',
          500: '#2F724A',
          600: '#1F6B43',
          700: '#14492F',
          800: '#0E3722',
          900: '#082417',
        },
        ember: {
          DEFAULT: '#F0852B', // bold amber CTA accent
          50: '#FEF3E8',
          100: '#FCE0C5',
          200: '#F9C188',
          300: '#F5A357',
          400: '#F0852B',
          500: '#DB6F16',
          600: '#B85A0F',
          700: '#8F470C',
        },
        ink: '#1C1A17',
        cream: '#FBF6EC',
        paper: '#FFFFFF',
        sand: '#F2E9D7',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        content: '1180px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 18px 40px -18px rgba(20, 73, 47, 0.28)',
        lift: '0 28px 60px -24px rgba(20, 73, 47, 0.40)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
