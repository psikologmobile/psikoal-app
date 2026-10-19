/**
 * PsikoAl · Tailwind preset (web uygulaması + tanıtım sitesi)
 * tokens.css'i global olarak yükleyin; renkler CSS değişkenlerinden okunur,
 * böylece data-theme="dark" ile tema tek yerden değişir.
 *
 *   // tailwind.config.js
 *   module.exports = { presets: [require('./tailwind.preset')], content: [...] }
 *
 * NativeWind (Expo) kullanıyorsanız aynı preset çalışır; değişkenleri
 * vars() ile root View'a verin ya da theme.ts'i doğrudan kullanın.
 */
const v = (name) => `var(--color-${name})`;

module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        border: { DEFAULT: v('border'), strong: v('border-strong') },
        fg: { DEFAULT: v('text'), muted: v('text-muted') },
        primary: { DEFAULT: v('primary'), fg: v('on-primary'), text: v('primary-text') },
        accent: { DEFAULT: v('accent'), fg: v('on-accent'), muted: v('on-accent-muted'), line: v('accent-line'), soft: v('accent-soft'), 'soft-fg': v('on-accent-soft') },
        link: v('link'),
        danger: { DEFAULT: v('danger'), soft: v('danger-soft'), 'soft-fg': v('on-danger-soft'), fill: v('danger-fill'), fg: v('on-danger') },
        scrim: v('scrim'),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['56px', { lineHeight: '1', letterSpacing: '-0.03em' }],
        h1: ['40px', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        h2: ['34px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        h3: ['28px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        title: ['20px', { lineHeight: '1.2' }],
      },
      borderRadius: { xs: '8px', sm: '12px', md: '14px', lg: '16px', xl: '18px', '2xl': '22px', '3xl': '24px', '4xl': '28px', sheet: '30px' },
      borderWidth: { DEFAULT: '1.5px', hair: '1.5px' },
      boxShadow: { none: 'none' },
      height: { 'btn-sm': '44px', 'btn-md': '50px', 'btn-lg': '56px', input: '52px' },
      width: { sidebar: '248px', rail: '84px' },
      transitionTimingFunction: { out: 'cubic-bezier(.2,.8,.2,1)', spring: 'cubic-bezier(.3,1.3,.5,1)' },
      transitionDuration: { press: '150ms', fast: '250ms', base: '400ms', enter: '550ms', slow: '900ms' },
      keyframes: {
        'enter-up': { from: { opacity: 0, transform: 'translateY(18px)' }, to: { opacity: 1, transform: 'none' } },
        'enter-right': { from: { opacity: 0, transform: 'translateX(40px)' }, to: { opacity: 1, transform: 'none' } },
        pop: { '0%': { transform: 'scale(0)' }, '70%': { transform: 'scale(1.12)' }, '100%': { transform: 'scale(1)' } },
        'draw-check': { from: { strokeDashoffset: '80' }, to: { strokeDashoffset: '0' } },
        'pulse-dot': { '0%': { transform: 'scale(1)', opacity: '.9' }, '100%': { transform: 'scale(2.6)', opacity: '0' } },
        ring: { from: { transform: 'scale(.7)', opacity: '.9' }, to: { transform: 'scale(2)', opacity: '0' } },
        skeleton: { '0%,100%': { opacity: '.4' }, '50%': { opacity: '1' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-7px)' }, '50%': { transform: 'translateX(7px)' }, '75%': { transform: 'translateX(-3px)' } },
        bell: { '0%,40%,100%': { transform: 'rotate(0)' }, '10%': { transform: 'rotate(14deg)' }, '20%': { transform: 'rotate(-12deg)' }, '30%': { transform: 'rotate(8deg)' } },
        bob: { '0%,100%': { transform: 'translateY(-2px)' }, '50%': { transform: 'translateY(3px)' } },
        drain: { from: { transform: 'scaleX(1)' }, to: { transform: 'scaleX(0)' } },
        fill: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        'sheet-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'none' } },
        'dialog-in': { from: { opacity: 0, transform: 'scale(.92)' }, to: { opacity: 1, transform: 'none' } },
        fade: { from: { opacity: 0 }, to: { opacity: 1 } },
        orbit: { to: { transform: 'rotate(360deg)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        toast: { '0%': { transform: 'translateY(140%)' }, '12%,88%': { transform: 'none' }, '100%': { transform: 'translateY(140%)' } },
      },
      animation: {
        'enter-up': 'enter-up 550ms cubic-bezier(.2,.8,.2,1) both',
        'enter-right': 'enter-right 450ms cubic-bezier(.2,.8,.2,1) both',
        pop: 'pop 400ms cubic-bezier(.2,.8,.2,1) both',
        'draw-check': 'draw-check 450ms ease-out both',
        'pulse-dot': 'pulse-dot 1.6s ease-out infinite',
        ring: 'ring 1.6s ease-out infinite',
        skeleton: 'skeleton 1.2s ease-in-out infinite',
        shake: 'shake 450ms ease-in-out both',
        bell: 'bell 2.4s 1s ease-in-out infinite',
        bob: 'bob 1.4s ease-in-out infinite',
        drain: 'drain 8s linear infinite',
        fill: 'fill 600ms cubic-bezier(.2,.8,.2,1) both',
        'sheet-up': 'sheet-up 380ms cubic-bezier(.2,.8,.2,1) both',
        'dialog-in': 'dialog-in 350ms cubic-bezier(.2,.8,.2,1) both',
        fade: 'fade 250ms ease-out both',
        orbit: 'orbit 14s linear infinite',
        float: 'float 3.2s ease-in-out infinite',
        toast: 'toast 2.6s cubic-bezier(.2,.8,.2,1) both',
      },
    },
  },
};
