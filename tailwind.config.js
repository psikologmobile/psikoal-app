/**
 * Psikosirius · v2 "Flat" Tailwind / NativeWind yapılandırması
 * Kaynak: docs/design-v2/tailwind.preset.js + theme.ts (src/core/theme/tokens.ts ile aynı).
 *
 * Renkler global.css'teki CSS değişkenlerinden okunur → açık/koyu tema tek yerden
 * değişir, ekranlarda `dark:` öneki GEREKMEZ. Örnek: `bg-surface border border-border text-fg`.
 *
 * KURAL: gölge (shadow-*) ve gradyan yok. Derinlik = yüzey tonu + 1.5 px çizgi.
 */
const v = (name) => `rgb(var(--color-${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── COLORS (v2 semantik) ───────────────────────────────────────────
      colors: {
        bg: v('bg'),
        surface: {
          DEFAULT: v('surface'),
          // @deprecated v1 adları → v2 semantik değişkenler
          base: v('bg'),
          raised: v('surface'),
          sunken: v('surface'),
        },
        border: {
          DEFAULT: v('border'),
          strong: v('border-strong'),
          // @deprecated
          muted: v('border'),
        },
        fg: { DEFAULT: v('text'), muted: v('text-muted') },
        primary: { DEFAULT: v('primary'), fg: v('on-primary'), text: v('primary-text') },
        accent: {
          DEFAULT: v('accent'),
          fg: v('on-accent'),
          muted: v('on-accent-muted'),
          line: v('accent-line'),
          soft: v('accent-soft'),
          'soft-fg': v('on-accent-soft'),
          // @deprecated v1 adları
          hover: v('accent'),
          subtle: v('accent-soft'),
          border: v('accent-line'),
          text: v('on-accent-soft'),
        },
        link: v('link'),
        danger: {
          DEFAULT: v('danger'),
          soft: v('danger-soft'),
          'soft-fg': v('on-danger-soft'),
          fill: v('danger-fill'),
          fg: v('on-danger'),
        },
        focus: v('focus'),

        // ─── @deprecated v1 (Sky / iOS Health) adları ─────────────────────
        // Eski ekranlar yeniden yazılana kadar derlensin ve v2 renkleriyle
        // görünsün diye v2 değişkenlerine yönlendirildi. YENİ KODDA KULLANMA.
        brand: {
          DEFAULT: v('primary'),
          hover: v('primary'),
          subtle: v('accent-soft'),
          muted: v('accent'),
          border: v('accent-line'),
          text: v('primary-text'),
        },
        content: {
          primary: v('text'),
          secondary: v('text-muted'),
          tertiary: v('text-muted'),
          disabled: v('text-muted'),
          inverse: v('bg'),
          link: v('link'),
        },
        dark: {
          bg: v('bg'),
          card: v('surface'),
          elevated: v('surface'),
          control: v('border-strong'),
          border: v('border'),
          border2: v('border-strong'),
        },
        tag: {
          DEFAULT: v('primary'),
          subtle: v('accent-soft'),
          muted: v('accent'),
          border: v('accent-line'),
          text: v('on-accent-soft'),
        },
        session: {
          DEFAULT: v('text-muted'),
          subtle: v('surface'),
          muted: v('border'),
          border: v('border-strong'),
          text: v('text'),
        },
        price: {
          DEFAULT: v('primary'),
          subtle: v('accent-soft'),
          muted: v('accent'),
          border: v('accent-line'),
          text: v('primary-text'),
        },
        semantic: {
          success: {
            light: v('accent-soft'),
            DEFAULT: v('primary-text'),
            dark: v('on-accent-soft'),
          },
          warning: {
            light: v('accent-soft'),
            DEFAULT: v('primary-text'),
            dark: v('on-accent-soft'),
          },
          error: { light: v('danger-soft'), DEFAULT: v('danger'), dark: v('on-danger-soft') },
          info: { light: v('accent-soft'), DEFAULT: v('primary-text'), dark: v('on-accent-soft') },
        },
        // v1 neutral → v2 zinc (sabit hex; yeni kodda semantik ad kullan)
        neutral: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          150: '#EDEDEF',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
      },

      // ─── TYPOGRAPHY ──────────────────────────────────────────────────────
      // RN özel yazı tiplerinde ağırlık sentezlemez: her ağırlık ayrı aile adıdır.
      fontFamily: {
        display: ['BricolageGrotesque_800ExtraBold'],
        'display-bold': ['BricolageGrotesque_700Bold'],
        body: ['Figtree_500Medium'],
        'body-regular': ['Figtree_400Regular'],
        'body-semibold': ['Figtree_600SemiBold'],
        'body-bold': ['Figtree_700Bold'],
        'body-heavy': ['Figtree_800ExtraBold'],
        mono: ['Courier New'],
      },
      fontSize: {
        // v2 tip ölçeği (theme.ts `type`)
        hero: ['44px', { lineHeight: '46px', letterSpacing: '-1.3px' }],
        h1: ['40px', { lineHeight: '41px', letterSpacing: '-1.2px' }],
        h2: ['34px', { lineHeight: '36px', letterSpacing: '-0.7px' }],
        h3: ['28px', { lineHeight: '31px', letterSpacing: '-0.6px' }],
        sheet: ['24px', { lineHeight: '28px' }],
        title: ['20px', { lineHeight: '24px' }],
        number: ['22px', { lineHeight: '26px' }],
        'body-lg': ['17px', { lineHeight: '25px' }],
        body: ['15px', { lineHeight: '22px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        label: ['13px', { lineHeight: '18px' }],
        button: ['17px', { lineHeight: '22px' }],
        badge: ['12px', { lineHeight: '16px' }],
        overline: ['12px', { lineHeight: '16px', letterSpacing: '1px' }],
        // genel ölçek
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '26px' }],
        xl: ['20px', { lineHeight: '26px' }],
        '2xl': ['24px', { lineHeight: '30px' }],
        '3xl': ['30px', { lineHeight: '34px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '50px' }],
        '6xl': ['56px', { lineHeight: '58px' }],
      },
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },

      // ─── SPACING (4'lük ızgara + yarım adımlar) ──────────────────────────
      spacing: {
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        4.5: '18px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        11: '44px',
        12: '48px',
        13: '52px',
        14: '56px',
        15: '60px',
        16: '64px',
        18: '72px',
        20: '80px',
        24: '96px',
        28: '112px',
        32: '128px',
        36: '144px',
        40: '160px',
        48: '192px',
        56: '224px',
        64: '256px',
      },
      height: {
        'btn-sm': '44px',
        'btn-md': '50px',
        'btn-lg': '56px',
        'btn-xl': '58px',
        input: '52px',
        tabbar: '72px',
      },
      minHeight: { touch: '44px', input: '52px' },
      width: { sidebar: '248px', rail: '84px' },
      maxWidth: { web: '1200px', dialog: '480px' },

      // ─── BORDER ──────────────────────────────────────────────────────────
      borderRadius: {
        none: '0px',
        xs: '8px',
        checkbox: '9px',
        inner: '10px',
        sm: '12px',
        md: '14px',
        lg: '16px',
        xl: '18px',
        card: '20px',
        '2xl': '22px',
        '3xl': '24px',
        panel: '26px',
        '4xl': '28px',
        sheet: '30px',
        phone: '32px',
        full: '9999px',
      },
      borderWidth: {
        DEFAULT: '1.5px',
        hair: '1.5px',
        0: '0px',
        2: '2px',
        3: '3px',
        4: '4px',
        6: '6px',
      },

      // ─── MOTION (web CSS geçişleri; RN için src/core/motion) ─────────────
      transitionTimingFunction: {
        out: 'cubic-bezier(.2,.8,.2,1)',
        spring: 'cubic-bezier(.3,1.3,.5,1)',
      },
      transitionDuration: {
        press: '150ms',
        fast: '250ms',
        tab: '300ms',
        base: '400ms',
        enter: '550ms',
        slow: '900ms',
      },

      // ─── Z-INDEX ─────────────────────────────────────────────────────────
      zIndex: {
        base: '0',
        raised: '10',
        dropdown: '20',
        sticky: '30',
        fixed: '40',
        overlay: '50',
        modal: '60',
        popover: '70',
        tooltip: '80',
        toast: '90',
        top: '100',
      },
    },
  },
  plugins: [],
}
