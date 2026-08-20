import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bgElevated: 'var(--bg-elev-1)',
        bgElev2: 'var(--bg-elev-2)',
        panel: 'var(--panel)',
        panelElev: 'var(--panel-elev)',
        panelBorder: 'var(--panel-border)',
        panelBorderStrong: 'var(--panel-border-strong)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        gold: 'var(--gold)',
        goldSoft: 'var(--gold-soft)',
        cosmic: 'var(--cosmic)',
        cosmicDeep: 'var(--cosmic-deep)',
        nebula: 'var(--nebula)',
        starlight: 'var(--starlight)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        // Twilight Vellum
        vellum: {
          bg: 'var(--bg-elev-2)',
          surface: 'var(--bg-elev-1)',
          chemistry: 'var(--vellum-chemistry)',
          lesson: 'var(--vellum-lesson)',
          rhythm: 'var(--vellum-rhythm)',
          fate: 'var(--vellum-fate)',
          compass: 'var(--vellum-compass)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        galaxy: 'linear-gradient(135deg, #000010 0%, #15043a 35%, #3a0a6b 70%, #7c2ed1 100%)',
        cosmic: 'linear-gradient(135deg, #0b0524 0%, #1a0a40 50%, #3b0d6b 100%)',
        aurora: 'linear-gradient(160deg, #021131 0%, #1e1a6e 50%, #9d3cb1 100%)',
      },
      boxShadow: {
        glow: '0 10px 60px -10px rgba(124, 92, 255, 0.6)',
      },
    },
  },
  plugins: [],
};

export default config;
