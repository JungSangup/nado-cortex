/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cortex: {
          dark: '#0b0f19',
          card: '#151d30',
          panel: '#1e293b',
          border: '#334155',
          cyan: '#06b6d4',
          cyanHover: '#22d3ee',
          purple: '#8b5cf6',
          purpleHover: '#a855f7',
          active: '#10b981',
          bypass: '#64748b',
          text: '#f8fafc',
          muted: '#94a3b8'
        }
      }
    },
  },
  plugins: [],
}
