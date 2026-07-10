/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        deep: '#0B0D12',
        panel: '#171A22',
        elevated: '#1E222D',
        gold: '#FFD700',
        'gold-dim': '#C9A800',
        risk: '#FF3344',
        win: '#00E676',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 40px rgba(255, 215, 0, 0.45)',
        'gold-lg': '0 0 80px rgba(255, 215, 0, 0.35)',
        risk: '0 0 40px rgba(255, 51, 68, 0.5)',
      },
      animation: {
        'pointer-idle': 'pointerPulse 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'wheel-shake': 'wheelShake 0.45s ease',
      },
      keyframes: {
        pointerPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.6))' },
          '50%': { filter: 'drop-shadow(0 0 28px rgba(255,215,0,1)) drop-shadow(0 0 50px rgba(255,140,0,0.5))' },
        },
        wheelShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
};
