/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        'bg-2': 'var(--bg-2)',
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        fg: 'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        'fg-subtle': 'var(--fg-subtle)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        dept: {
          eng: '#0070F3',
          trd: '#F5A623',
          st: '#8E4EC6',
        }
      },
      boxShadow: {
        drawer: 'var(--shadow-drawer)',
      }
    },
  },
  plugins: [],
}
