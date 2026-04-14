import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'bounce-in': 'bounceIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        bounceIn: { '0%': { transform: 'scale(0.9)', opacity: '0' }, '50%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  // CRITICAL: Safelist prevents purging of dynamic/admin-controlled classes
  safelist: [
    // Layout
    'dir-rtl', 'dir-ltr',
    'font-arabic', 'font-sans',
    // Grid
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4',
    'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4',
    // Display
    'hidden', 'block', 'flex', 'inline-flex', 'grid',
    // Sizes
    'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl',
    // Brand colors (used dynamically)
    {
      pattern: /^(bg|text|border|ring)-(brand|red|green|yellow|blue|purple|orange|gray)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    // Status badges
    'bg-green-100', 'text-green-800', 'bg-blue-100', 'text-blue-800',
    'bg-gray-100', 'text-gray-800', 'bg-red-100', 'text-red-800',
    'dark:bg-green-900/30', 'dark:text-green-400',
    'dark:bg-blue-900/30', 'dark:text-blue-400',
    'dark:bg-gray-800', 'dark:text-gray-400',
    // RTL utilities
    'ltr:ml-auto', 'rtl:mr-auto', 'rtl:space-x-reverse',
  ],
  plugins: [],
}

export default config
