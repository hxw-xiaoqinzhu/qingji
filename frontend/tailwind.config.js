/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FCF8F9',
        surface: '#FFFFFF',
        ink: '#3D3236',
        'ink-secondary': '#8A7B81',
        'ink-muted': '#B8AAB0',
        brand: '#DC99AA',
        'brand-deep': '#A86E7E',
        'brand-light': '#F0C8D2',
        'brand-soft': '#FAF0F3',
        champagne: '#B08D79',
        'champagne-soft': '#FAF3EE',
        'status-locked-text': '#A66E7E',
        'status-locked-bg': '#FAF0F3',
        'status-reserved-text': '#AD8972',
        'status-reserved-bg': '#FAF4EF',
        'status-danger-text': '#B56E80',
        'status-danger-bg': '#FBF0F3',
        'status-rest-text': '#9E9096',
        'status-rest-bg': '#F5F2F4',
      },
      fontFamily: {
        sans: [
          '"PingFang SC"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Hiragino Sans GB"',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '22px',
        sheet: '28px',
      },
      boxShadow: {
        card: '0 6px 22px -8px rgba(180, 136, 148, 0.08), 0 2px 6px -1px rgba(180, 136, 148, 0.03)',
        rose: '0 6px 16px -4px rgba(220, 153, 170, 0.28)',
        float: '0 -4px 20px rgba(160, 120, 132, 0.05)',
      },
      transitionTimingFunction: {
        ios: 'cubic-bezier(0.32, 0.72, 0, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
