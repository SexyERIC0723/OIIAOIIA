/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0a0e17',
          border: '#1a2332',
          text: '#00ff41',
          dim: '#00cc33',
          accent: '#00ffff',
        },
        rave: {
          pink: '#ff00ff',
          cyan: '#00ffff',
          yellow: '#ffff00',
          purple: '#9d00ff',
        }
      },
      animation: {
        'spin-smooth': 'spin 1s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'rave-flash': 'raveFlash 0.5s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 65, 1)' },
        },
        raveFlash: {
          '0%, 100%': { backgroundColor: '#ff00ff' },
          '25%': { backgroundColor: '#00ffff' },
          '50%': { backgroundColor: '#ffff00' },
          '75%': { backgroundColor: '#9d00ff' },
        }
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
