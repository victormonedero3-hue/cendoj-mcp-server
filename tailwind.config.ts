import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        electricBlue: '#005BFF',
        carbon: '#0A0A0A',
        neonGreen: '#00FF9D',
        surface: '#13161D',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0, 91, 255, 0.35), 0 0 30px rgba(0, 91, 255, 0.45)',
        neon: '0 0 0 1px rgba(0, 255, 157, 0.35), 0 0 30px rgba(0, 255, 157, 0.35)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};

export default config;
