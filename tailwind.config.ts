import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Cream Palette - Primary brand colors
        'luxury-cream': {
          50: '#f1e1ca',
          100: '#fdf8f1',
          200: '#faf0e4',
          300: '#f5e6d3',
          400: '#eed5b7',
          500: '#e4c097',
          600: '#d4a574',
          700: '#c08b5c',
          800: '#a0714a',
          900: '#80593c',
          950: '#462f20',
        },
        // Luxury Beige Palette - Borders, dividers, and accents
        'luxury-beige': {
          50: '#faf9f7',
          100: '#f3f0ea',
          200: '#e6dfd1',
          300: '#d6c9b4', // Primary border color
          400: '#c4b197',
          500: '#b39b7d',
          600: '#a08970', // Primary brand accent - hover states
          700: '#85735f',
          800: '#6d5f50',
          900: '#594e42',
          950: '#2f2822',
        },
        // Luxury Charcoal - Text and dark elements
        'luxury-charcoal': {
          600: '#636363', // Tertiary text
          700: '#545454', // Secondary text
          800: '#494949', // Body text
          900: '#404040', // Primary headings
        },
        // Luxury Obsidian - Darkest text/foreground
        'luxury-obsidian': {
          950: '#1a1a1a',
        },
        // Luxury Gold Accents - CTAs and highlights (minimal usage)
        'luxury-gold': {
          400: '#ffe670', // Highlights
          500: '#ffd43b', // Focus states
          600: '#f4c430', // Primary gold for CTAs
        },
        // Primary mapping to luxury-beige for buttons/CTAs
        primary: {
          50: '#faf9f7',
          100: '#f3f0ea',
          200: '#e6dfd1',
          300: '#d6c9b4',
          400: '#c4b197',
          500: '#b39b7d',
          600: '#a08970', // Main primary color
          700: '#85735f',
          800: '#6d5f50',
          900: '#594e42',
          950: '#2f2822',
        },
        // Keep secondary for future use
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        // Neutral mapping to luxury-cream for backgrounds
        neutral: {
          50: '#f1e1ca',
          100: '#fdf8f1',
          200: '#faf0e4',
          300: '#f5e6d3',
          400: '#eed5b7',
          500: '#e4c097',
          600: '#d4a574',
          700: '#c08b5c',
          800: '#a0714a',
          900: '#80593c',
          950: '#462f20',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
export default config;
