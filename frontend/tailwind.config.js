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
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
