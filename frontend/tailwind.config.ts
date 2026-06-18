import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bench: 'var(--bg)',
        machined: 'var(--machined)',
        raised: 'var(--raised)',
        groove: 'var(--groove)',
        hone: 'var(--hone)',
        'hone-deep': 'var(--hone-deep)',
        spark: 'var(--spark)',
        steel: 'var(--steel)',
        chalk: 'var(--chalk)',
        ash: 'var(--ash)',
        faint: 'var(--faint)',
        hair: 'var(--hairline)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Arial Black', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
