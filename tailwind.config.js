/** @type {import('tailwindcss').Config} */

export default {

  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {

    extend: {

      colors: {

        deep: '#0a0814',

        panel: '#141024',

        elevated: '#1c1734',

        gold: '#B56BFF',

        'gold-dim': '#8F4FD6',

        risk: '#FF3344',

        win: '#00E676',

      },

      fontFamily: {

        display: ['Orbitron', 'sans-serif'],

        body: ['Inter', 'sans-serif'],

      },

      boxShadow: {

        gold: '0 0 40px rgba(176, 108, 255, 0.45)',

        'gold-lg': '0 0 80px rgba(176, 108, 255, 0.35)',

        risk: '0 0 40px rgba(255, 51, 68, 0.5)',

      },

      animation: {

        'pointer-idle': 'pointerPulse 2s ease-in-out infinite',

        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',

        'wheel-shake': 'wheelShake 0.45s ease',

        'profile-sparkle-rise': 'profileSparkleRise linear infinite',

      },

      keyframes: {

        pointerPulse: {

          '0%, 100%': { filter: 'drop-shadow(0 0 12px rgba(176,108,255,0.6))' },

          '50%': { filter: 'drop-shadow(0 0 28px rgba(176,108,255,1)) drop-shadow(0 0 50px rgba(124,58,237,0.5))' },

        },

        wheelShake: {

          '0%, 100%': { transform: 'translateX(0)' },

          '20%': { transform: 'translateX(-6px)' },

          '40%': { transform: 'translateX(6px)' },

          '60%': { transform: 'translateX(-4px)' },

          '80%': { transform: 'translateX(4px)' },

        },

        profileSparkleRise: {

          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },

          '8%': { opacity: 'var(--sparkle-opacity, 0.25)' },

          '92%': { opacity: 'var(--sparkle-opacity, 0.25)' },

          '100%': { transform: 'translateY(-115vh) translateX(var(--sparkle-drift, 0px))', opacity: '0' },

        },

      },

    },

  },

  plugins: [],

};

