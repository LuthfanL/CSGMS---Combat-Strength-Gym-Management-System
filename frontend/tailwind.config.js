/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-main)',
        foreground: 'var(--text-main)',
        card: 'var(--bg-card)',
        sidebar: 'var(--bg-sidebar)',
        dashboard: 'var(--bg-dashboard)',
        border: 'var(--border-color)',
        primary: {
          DEFAULT: 'var(--accent-neon)',
          hover: 'var(--accent-hover)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'scan': 'scan 2s linear infinite',
        'gradient-xy': 'gradient-xy 3s ease infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(160px)' },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      }
    },
  },
  plugins: [],
}
