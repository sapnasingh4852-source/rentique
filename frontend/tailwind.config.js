/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#231726',
        plum: {
          DEFAULT: '#3D1B33',
          deep: '#2A1124',
          soft: '#5A314C',
          mist: '#F1E7EF'
        },
        saffron: {
          DEFAULT: '#E86A24',
          deep: '#C8531A',
          soft: '#FBE6D6'
        },
        forest: {
          DEFAULT: '#1E5C45',
          deep: '#174733',
          soft: '#E3EFE8'
        },
        rani: {
          DEFAULT: '#C94A63',
          soft: '#FAE3E8'
        },
        paper: '#FBF6EC',
        surface: '#FFFCF6',
        line: '#EADCC8',
        gold: '#C9A227',
        muted: '#7A6B5D'
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        hindi: ['Tiro Devanagari Hindi', 'serif']
      },
      boxShadow: {
        soft: '0 1px 2px rgba(35, 23, 38, 0.04), 0 12px 32px -18px rgba(61, 27, 51, 0.28)',
        lift: '0 2px 4px rgba(35, 23, 38, 0.05), 0 28px 50px -24px rgba(61, 27, 51, 0.35)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)'
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' }
        }
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        floaty: 'floaty 7s ease-in-out infinite',
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.6s linear infinite'
      }
    }
  },
  plugins: []
};
