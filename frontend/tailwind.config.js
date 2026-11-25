/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Grotesk"', '"Vazirmatn"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Vazirmatn"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        paper: '#F7F5F0',
        cream: '#EFECE6',
        ink: '#18181B',
        'ink-muted': '#52525B',
        reagent: '#0D9488',
        'reagent-dark': '#0F766E',
        'chem-amber': '#F59E0B',
        'chem-emerald': '#16A34A',
        'chem-crimson': '#E11D48',
        'chem-nitrogen': '#2563EB',
        'dot-grid': '#D6D3CD',
      },
      borderRadius: {
        panel: '8px',
        control: '6px',
      },
      boxShadow: {
        tactile: '4px 4px 0px #18181B',
        'tactile-sm': '2px 2px 0px #18181B',
        'tactile-lg': '6px 6px 0px #18181B',
      },
    },
  },
  plugins: [],
};
