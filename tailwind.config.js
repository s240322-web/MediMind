/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // MediMind design system — "clinical notebook" palette
        pine: {
          DEFAULT: '#0B1F1C',
          50: '#E8EDEC',
          100: '#C7D3D1',
          200: '#9FB3AF',
          300: '#6E8C86',
          400: '#3F5B56',
          500: '#1A332E',
          600: '#0B1F1C',
          700: '#081613',
          800: '#050E0C',
          900: '#020605',
        },
        paper: {
          DEFAULT: '#F7F5F0',
          dim: '#EFEBE2',
        },
        sage: {
          DEFAULT: '#3D8B7A',
          50: '#EAF4F1',
          100: '#CFE6DF',
          200: '#A4D0C3',
          300: '#79B9A7',
          400: '#3D8B7A',
          500: '#326F62',
          600: '#28584E',
          700: '#1E423B',
        },
        clay: {
          DEFAULT: '#C97B5E',
          50: '#FBEEE8',
          100: '#F3D4C5',
          200: '#E7AE92',
          300: '#DB895F',
          400: '#C97B5E',
          500: '#A85F45',
          600: '#824834',
        },
        stone: {
          DEFAULT: '#E8E4DA',
          dark: '#D4CEC0',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-line': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'typing-dot': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-4px)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-line': 'pulse-line 2.5s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s ease-out',
        'typing-dot': 'typing-dot 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
