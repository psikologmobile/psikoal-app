<!-- Bu dosya psikoAL kök klasöründen taşındı (DEVOPS-PSIKOAL.md, Faz 1 / adım 8).
     Kanonik kaynak artık burasıdır; kök kopyası kaldırılmıştır. -->

@AGENTS.md

# CLAUDE.md

> Bu dosya iki bölümden oluşur.
> **PART 1 — Universal Core:** Bu `core/` mimarisini kullanan her React Native / Expo projesinde geçerlidir. Yeni projeye taşınırken bu bölüm olduğu gibi korunur.
> **PART 2 — PsikoAl:** Yalnızca bu projeye özgü kurallar, domain tanımları ve iş mantığı. Yeni projede bu bölüm sıfırdan yazılır.

---

## PART 1 — UNIVERSAL CORE

### 1. Temel Prensipler

1. **Component = Görünüm.** İş mantığı componentin içinde olmaz; hook veya service katmanına taşınır.
2. **Atomic hiyerarşi bozulmaz.** Atom → Molecule → Organism → Template. Katman atlanamaz, geriye doğru import yapılamaz.
3. **Domain izolasyonu kesindir.** Bir domain başka bir domainden sadece `index.ts` barrel'ı üzerinden import alabilir.
4. **Server state = TanStack Query. UI state = Zustand. Component state = useState.** Bu üç kategori karıştırılmaz.
5. **Zod schema'ları tip sisteminin tek kaynağıdır.** API response ve form tipleri Zod'dan `z.infer<>` ile türetilir.
6. **NativeWind className'leri dışında stil yazılmaz.** `StyleSheet.create` ve inline `style={}` kullanılmaz; zorunlu kalınırsa yorum ile gerekçelendirilir.

---

### 2. Klasör ve Dosya Yapısı

#### App İç Yapısı

```
src/
  app/                  ← Expo Router: route dosyaları burada
    (auth)/             ← Auth group (header/tab yok)
      login.tsx
      register.tsx
    (tabs)/             ← Ana tab grubu
      index.tsx         ← Home
      explore.tsx
      profile.tsx
    _layout.tsx
  core/                 ← Evrensel atomic design sistemi
    components/
      atoms/
      molecules/
      organisms/
      templates/
    hooks/              ← Evrensel utility hook'lar
    utils/              ← Pure functions
    types/              ← Evrensel tipler
    theme/              ← Design tokens, NativeWind config
  screens/              ← Rol bazlı ekran kompozisyonları (route dosyaları ince switch olarak kalır)
    home/               ← ExpertHomeScreen + ClientHomeScreen + HomeHero
    offers/             ← ExpertOffersScreen + ClientListingsScreen
  domains/              ← İş mantığı katmanları
    [domain-adı]/
      api/              ← TanStack Query hooks (useXxxQuery, useXxxMutation)
      components/       ← Domain'e özel molecules/organisms
      hooks/            ← İş mantığı hook'ları
      schemas/          ← Zod schemas
      types/            ← z.infer<> ile türetilmiş tipler
      utils/            ← Domain yardımcıları
      store/            ← Zustand slice (gerekirse)
      index.ts          ← PUBLIC API — sadece burası dışarıya açılır
  lib/
    api.ts              ← Axios/Fetch instance
    queryClient.ts      ← TanStack Query config
    storage.ts          ← MMKV instance
  store/
    index.ts            ← Zustand root store
  navigation/           ← Typed navigation helpers
```

#### Dosya Adlandırma Kuralları

```
Component dosyası    →  PascalCase.tsx           Button.tsx, ExpertCard.tsx
Hook dosyası         →  useXxx.ts               useExpertList.ts, useOfferPrice.ts
Util dosyası         →  verb-noun.ts            formatPrice.ts, parseDate.ts
Schema dosyası       →  [domain].schema.ts      offer.schema.ts
Tip dosyası          →  [domain].types.ts       expert.types.ts
Sabit dosyası        →  [domain].constants.ts   offer.constants.ts
Test dosyası         →  [dosya].test.tsx         Button.test.tsx
Index barrel         →  index.ts                (sadece public API için)
```

#### Component Klasör Yapısı (her atom/molecule/organism için)

```
core/components/atoms/Button/
  Button.tsx
  Button.test.tsx
  index.ts            ← export { Button } from './Button';
```

---

### 3. Atomic Design Kuralları

| Katman       | Tanım                                                                  | İçe aktarabilir          | İçe aktaramaz                |
| ------------ | ---------------------------------------------------------------------- | ------------------------ | ---------------------------- |
| **Atom**     | Bölünemez en küçük birim. Sadece kendi stilini ve prop'larını bilir.   | —                        | Molecule, Organism, Template |
| **Molecule** | 2-5 atom'un belirli bir amaca hizmet edecek şekilde bir araya gelmesi. | Atom                     | Organism, Template           |
| **Organism** | Bağımsız, ekranda yer alan karmaşık UI bloğu. Kendi hook'u olabilir.   | Atom, Molecule           | Template                     |
| **Template** | Ekran iskelet düzeni. İçerik placeholder'larla doldurulur.             | Atom, Molecule, Organism | —                            |

**Karar kuralı:** "Bu component'i başka bir projede kullanır mıyım?"

- Evet → `core/components/`'a yaz.
- Hayır → İlgili `domains/[x]/components/`'a yaz.

---

### 4. TypeScript Standartları

```typescript
// ✅ Doğru: Props tipi ayrı tanımlanır, React.FC kullanılmaz
type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
};

export function Button({ label, onPress, variant = 'primary', isLoading = false }: ButtonProps) {
  ...
}

// ❌ Yanlış: React.FC, inline tip, any
const Button: React.FC<{ label: string; onPress: any }> = ({ label, onPress }) => ...
```

```typescript
// ✅ Doğru: Zod'dan tip türet
import { z } from 'zod'

export const ExpertSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  rating: z.number().min(0).max(5),
  isVerified: z.boolean(),
})

export type Expert = z.infer<typeof ExpertSchema>

// ❌ Yanlış: Manuel type tanımı (schema'dan bağımsız)
type Expert = {
  id: string
  name: string
  rating: number
  isVerified: boolean
}
```

**Kesin yasaklar:**

- `any` kullanımı → `unknown` kullan, gerekirse type guard yaz
- `as` casting → Zorunluysa `// REASON: ...` yorumuyla gerekçelendir
- Non-null assertion `!` → Optional chaining `?.` veya guard kullan
- Loose object tipler → Tüm alanlar explicit tanımlanır

---

### 5. Component Yazım Kalıbı

```typescript
// core/components/atoms/Button/Button.tsx

import { Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/core/components/atoms/Text'; // ← Absolute import

// 1. Props tipi en üstte
type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string; // ← NativeWind için
};

// 2. Variant/style map — component dışında, render'da hesaplanmaz
const variantStyles = {
  primary:   'bg-primary',
  secondary: 'bg-accent',
  outline:   'border border-border-strong',
} as const;

const sizeStyles = {
  sm: 'h-9 px-3.5',
  md: 'h-11 px-5',
  lg: 'h-13 px-6',
} as const;

// 3. Named export (barrel index.ts'ten re-export edilir)
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  className,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled || isLoading}
      className={`
        flex-row items-center justify-center rounded-xl
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isDisabled ? 'opacity-40' : ''}
        ${className ?? ''}
      `}
    >
      {isLoading
        ? <Spinner />
        : <Text variant="label" className={variant === 'primary' ? 'text-primary-fg' : 'text-accent-fg'}>{label}</Text>
      }
    </Pressable>
  );
}

// 4. Props tipini dışa aktar (consumer'lar extend edebilsin)
export type { ButtonProps };
```

---

### 6. Hook Yazım Kalıbı

```typescript
// domains/offer/hooks/useOfferCountdown.ts

import { useState, useEffect, useCallback } from 'react'
import { OFFER_TIER_DURATION_MS } from '../offer.constants'

// 1. Dönüş tipi explicit tanımlanır
type UseOfferCountdownReturn = {
  remainingSeconds: number
  currentTier: number
  isExpired: boolean
  resetTimer: () => void
}

// 2. Hook parametreleri tek obje içinde (genişlemesi kolay)
type UseOfferCountdownParams = {
  offerId: string
  tierCount: number
  startedAt: Date
}

export function useOfferCountdown({
  offerId,
  tierCount,
  startedAt,
}: UseOfferCountdownParams): UseOfferCountdownReturn {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calculateRemaining(startedAt, OFFER_TIER_DURATION_MS)
  )

  // Yan etki hook'larında cleanup zorunludur
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval) // ← cleanup
  }, [])

  const resetTimer = useCallback(() => {
    setRemainingSeconds(OFFER_TIER_DURATION_MS / 1000)
  }, [])

  const currentTier = Math.floor(
    (OFFER_TIER_DURATION_MS / 1000 - remainingSeconds) / (OFFER_TIER_DURATION_MS / 1000 / tierCount)
  )

  return {
    remainingSeconds,
    currentTier: Math.min(currentTier, tierCount - 1),
    isExpired: remainingSeconds === 0,
    resetTimer,
  }
}
```

**TanStack Query hook kalıbı:**

```typescript
// domains/expert/api/useExpertProfileQuery.ts

import { useQuery } from '@tanstack/react-query'
import { ExpertSchema } from '../schemas/expert.schema'
import { expertKeys } from '../expert.constants'
import { getExpertProfile } from '@/lib/api'

export function useExpertProfileQuery(expertId: string) {
  return useQuery({
    queryKey: expertKeys.profile(expertId), // ← query key factory kullan
    queryFn: async () => {
      const data = await getExpertProfile(expertId)
      return ExpertSchema.parse(data) // ← Zod ile parse et, tip güvenli
    },
    staleTime: 5 * 60 * 1000, // 5 dakika
    enabled: Boolean(expertId), // ← Guard: id yoksa çalışma
  })
}

// Query key factory — her domain kendi key factory'sini tanımlar
export const expertKeys = {
  all: ['experts'] as const,
  lists: () => [...expertKeys.all, 'list'] as const,
  profile: (id: string) => [...expertKeys.all, 'profile', id] as const,
} as const
```

---

### 7. State Management Kuralları

**Ne zaman ne kullanılır:**

```
API'den gelen veri          →  TanStack Query (useQuery / useMutation)
Global UI state             →  Zustand (auth bilgisi, tema, notification count)
Component'e özel UI state   →  useState (modal açık mı, input değeri)
Kalıcı local veri           →  MMKV (token, kullanıcı tercihleri)
Form state                  →  React Hook Form + Zod resolver
```

**Zustand slice kalıbı:**

```typescript
// domains/auth/store/authStore.ts

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '@/lib/storage' // MMKV storage

type AuthState = {
  userId: string | null
  role: 'expert' | 'client' | null
  isAuthenticated: boolean
}

type AuthActions = {
  setAuth: (userId: string, role: AuthState['role']) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      userId: null,
      role: null,
      isAuthenticated: false,
      setAuth: (userId, role) => set({ userId, role, isAuthenticated: true }),
      clearAuth: () => set({ userId: null, role: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => storage), // MMKV adapter
    }
  )
)
```

---

### 8. Styling Kuralları (NativeWind)

```typescript
// ✅ Doğru: className, semantik token'lardan — shadow KULLANILMAZ, border ile derinlik
<View className="bg-surface px-5 pt-4 rounded-3xl border border-border">
  <Text variant="title">Başlık</Text>
</View>

// ✅ Doğru: Platform-specific prefix
<View className="ios:pt-safe android:pt-4">

// ✅ Doğru: Conditional (cn() utility ile)
import { cn } from '@/core/utils/cn';
<View className={cn('rounded-xl p-4', isActive && 'bg-accent-soft border border-accent-line')}>

// ❌ Yanlış: StyleSheet
const styles = StyleSheet.create({ container: { padding: 16 } });

// ❌ Yanlış: inline style
<View style={{ padding: 16, backgroundColor: '#F2F1FD' }}>

// ❌ Yanlış: arbitrary value / ham palet (design token varsa)
<View className="bg-[#0EA5E9]">   // → bg-primary kullan
<View className="bg-sky-500">     // → bg-primary kullan

// ❌ PSİKOAL KURALI — shadow sınıfı ASLA kullanılmaz (flat design)
<View className="shadow-sm">      // YASAK
<View className="shadow-md">      // YASAK
<View className="shadow-lg">      // YASAK
// ✅ Derinlik için border + arka plan rengi farkı kullan:
<View className="border border-border bg-surface">         // kart
<View className="bg-accent-soft">                          // vurgulu bilgi yüzeyi
<View className="border-b border-border">                  // ayraç
```

**`cn()` utility (clsx + tailwind-merge):**

```typescript
// core/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

### 9. Navigation Kuralları (Expo Router)

```
app/
  _layout.tsx               ← Root layout (providers burada)
  (auth)/
    _layout.tsx             ← Auth stack layout
    login.tsx               ← /login
    register.tsx            ← /register
    onboarding.tsx          ← /onboarding
  (tabs)/
    _layout.tsx             ← Tab bar layout
    index.tsx               ← / (Home)
    explore.tsx             ← /explore
    profile.tsx             ← /profile
  modal/
    [id].tsx                ← /modal/[id] (modal presentation)
  expert/
    [id].tsx                ← /expert/[id] (profile screen)
  offer/
    [id]/
      index.tsx             ← /offer/[id]
      confirm.tsx           ← /offer/[id]/confirm
```

**Typed navigation:**

```typescript
// ✅ Doğru: Expo Router hook'ları
import { useRouter, useLocalSearchParams } from 'expo-router'

function ExpertScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  router.push(`/offer/${id}`)
}

// ❌ Yanlış: React Navigation doğrudan (Expo Router varsa)
navigation.navigate('ExpertScreen', { id })
```

---

### 10. Test Kuralları

**Coverage hedefleri:**

- `core/components/atoms/` → %100 (bütün prop kombinasyonları)
- `core/hooks/` → %100
- `domains/*/hooks/` → %80 minimum
- `domains/*/utils/` → %100
- Organism/Screen → kritik flow'lar (smoke test yeterli)

**Test kalıbı:**

```typescript
// core/components/atoms/Button/Button.test.tsx

import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('label renders correctly', () => {
    const { getByText } = render(<Button label="Devam Et" onPress={jest.fn()} />);
    expect(getByText('Devam Et')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Devam Et" onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Devam Et" onPress={onPress} isDisabled />);
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

---

### 11. Import Düzeni

Her dosyada import'lar şu sırada olur (ESLint `import/order` ile zorlanır):

```typescript
// 1. React ve React Native core
import React, { useState, useCallback } from 'react'
import { View, Pressable } from 'react-native'

// 2. Expo paketleri
import * as Haptics from 'expo-haptics'

// 3. Üçüncü taraf kütüphaneler (alfabetik)
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

// 4. Core (absolute @ path)
import { Text, Icon } from '@/core/components/atoms'
import { useDebounce } from '@/core/hooks'
import { cn } from '@/core/utils/cn'

// 5. Diğer domain'lerden (sadece index.ts'den)
import { useAuthStore } from '@/domains/auth'

// 6. Aynı domain içinden (relative)
import { OfferSchema } from '../schemas/offer.schema'
import { useOfferCountdown } from '../hooks/useOfferCountdown'

// 7. Tipler (en sonda)
import type { Offer } from '../types/offer.types'
```

---

### 12. Sık Yapılan Hatalar (Anti-patterns)

```typescript
// ❌ Domain içinde başka domaine direkt import
import { Expert } from '../../expert/types/expert.types' // YASAK
// ✅ Barrel üzerinden
import type { Expert } from '@/domains/expert'

// ❌ useState ile server state
const [experts, setExperts] = useState([])
useEffect(() => {
  fetchExperts().then(setExperts)
}, []) // YASAK
// ✅ TanStack Query
const { data: experts } = useExpertListQuery()

// ❌ Component içinde iş mantığı
function ExpertCard({ expertId }) {
  const [price, setPrice] = useState(0)
  useEffect(() => {
    // fiyat hesaplama mantığı... YASAK
  }, [])
}
// ✅ Hook'a taşı
function ExpertCard({ expertId }) {
  const { price } = useExpertPrice(expertId) // temiz
}

// ❌ Atom'dan organism import
// core/components/atoms/Button/Button.tsx içinde:
import { ExpertCard } from '../organisms/ExpertCard' // YASAK

// ❌ Zod olmadan API parse
const expert = response.data as Expert // güvensiz, YASAK
// ✅
const expert = ExpertSchema.parse(response.data) // runtime güvenli

// ❌ Magic string domain key
queryClient.invalidateQueries(['experts']) // kırılgan, YASAK
// ✅ Query key factory
queryClient.invalidateQueries({ queryKey: expertKeys.all })
```

---

## PART 2 — PsikoAl

### 1. Proje Özeti

PsikoAl, psikologları (Uzman) ve terapi almak isteyen kullanıcıları (Danışan) bir araya getiren iki taraflı Türk pazar yeridir. Armut modelinin psikoloji sektörüne uyarlanmasıdır.

**Platform çalışma prensibi:**

- Faz 1: Psikolog danışanı platforma manuel ekler → sistem davet gönderir → eşleşme kurulur
- Faz 2: Danışan platforma doğrudan kayıt olur → psikolog havuzuna erişir

---

### 2. Tasarım Kısıtları (Değiştirilemez) — v2 "PsikoAl · Flat"

Kaynak: `docs/design-v2/` (README, components.md, animations.md, screens.md, theme.ts, tokens.css) ve ekran çizimleri `tasarim-paketi/v2-ekranlar/`. Bu kurallar tüm PsikoAl geliştirmelerinde uygulanır; PR review'da kontrol edilir.

**Renk — semantik tokenlar (zinc %80 · sky %20 · hata için red)**

Ekranlar YALNIZ semantik sınıfları kullanır; açık/koyu tema `global.css` CSS değişkenleriyle tek yerden değişir, `dark:` öneki **yazılmaz**. Hex gereken prop'larda (`Icon color`, SVG `stroke`, `placeholderTextColor`) `useThemeColors()` kullanılır. Değerlerin tek kaynağı `src/core/theme/tokens.ts`; `global.css` ile eşitliğini `tokens.test.ts` denetler.

| Token (`useThemeColors`)                                   | className                                                                                                      | Açık                             | Koyu                              | Kullanım                                                                        |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------- | ------------------------------------------------------------------------------- |
| bg                                                         | `bg-bg`                                                                                                        | zinc-50                          | zinc-950                          | sayfa zemini                                                                    |
| surface                                                    | `bg-surface`                                                                                                   | zinc-100                         | zinc-900                          | kart, input zemini, sekme çubuğu                                                |
| border / borderStrong                                      | `border-border` / `border-border-strong`                                                                       | zinc-200 / 300                   | zinc-800 / 700                    | ayraç · outline düğme, input                                                    |
| text / textMuted                                           | `text-fg` / `text-fg-muted`                                                                                    | zinc-900 / 600                   | zinc-50 / 400                     | ana / ikincil yazı                                                              |
| primary / onPrimary / primaryText                          | `bg-primary` / `text-primary-fg` / `text-primary-text`                                                         | sky-500 / 950 / 700              | sky-500 / 950 / 400               | ana eylem, seçili, rozet                                                        |
| accent / onAccent / onAccentMuted / accentLine             | `bg-accent` / `text-accent-fg` / `text-accent-muted` / `border-accent-line`                                    | sky-200 / 950 / 800 / 300        | sky-950 / 100 / 300 / 900         | vurgu yüzeyi (hero, seçili süzgeç)                                              |
| accentSoft / onAccentSoft                                  | `bg-accent-soft` / `text-accent-soft-fg`                                                                       | sky-100 / 800                    | sky-900 / 100                     | çip, bilgi kutusu, aktif menü                                                   |
| link                                                       | `text-link`                                                                                                    | sky-700                          | sky-300                           | bağlantı, metin düğme                                                           |
| danger / dangerSoft / onDangerSoft / dangerFill / onDanger | `text-danger` `border-danger` / `bg-danger-soft` / `text-danger-soft-fg` / `bg-danger-fill` / `text-danger-fg` | red-600 / 50 / 700 / 600 / beyaz | red-400 / 950 / 300 / 600 / beyaz | **yalnız** hata ve geri alınamaz işlem; hata kutusu `accessibilityRole="alert"` |
| scrim                                                      | `bg-zinc-950/45 dark:bg-black/60`                                                                              | —                                | —                                 | sheet/dialog arkası (tek `dark:` istisnası)                                     |

- Primary üstündeki yazı **sky-950** (`text-primary-fg`), beyaz değildir.
- v1 adları (`brand-*`, `content-*`, `surface-base/raised/sunken`, `dark-*`, `neutral-*`, `tag/session/price/semantic-*`) yalnız eski ekranlar derlensin diye v2 değişkenlerine yönlendirildi; **yeni kodda kullanılmaz**, ekranlar yenilendikçe silinecek.
- Ham palet (`bg-sky-500`, `text-zinc-600`), hex ve arbitrary renk yazılmaz.

**Tipografi — Bricolage Grotesque (başlık, büyük rakam) + Figtree (gövde)**

`@expo-google-fonts/bricolage-grotesque` (700, 800) ve `@expo-google-fonts/figtree` (400–800) `src/app/_layout.tsx`'te yüklenir. RN özel fontta ağırlık sentezlemez: ağırlık = aile sınıfı (`font-display` 800, `font-display-bold` 700, `font-body` 500, `font-body-regular` 400, `font-body-semibold` 600, `font-body-bold` 700, `font-body-heavy` 800). `font-bold` gibi ağırlık sınıfları kullanılmaz; `<Text weight>` aileyi değiştirir.

Ölçek (`<Text variant>` ya da `text-*`): hero 44 · h1 40 · h2 34 (sekme başlığı) · h3 28 · sheet 24 · title 20 · number 22 · bodyLg 17 · body 15 · bodySm 14 · label 13/700 · button 17/800 · badge 12/800 · overline 12/800 büyük harf.

**Gölge ve gradyan — kesinlikle yasak**

`shadow-*`, `elevation`, `shadowColor/Opacity`, `expo-linear-gradient` kullanılmaz. Katmanlar **surface tonu + 1,5 px çizgi** ile ayrılır (`border` sınıfı = 1.5px). Sol accent border (`border-l-4`) yok.

**Köşe, boşluk, ölçü**

- Radius: `rounded-xs` 8 · `checkbox` 9 · `inner` 10 · `sm` 12 · `md` 14 (düğme/input) · `lg` 16 · `xl` 18 · `card` 20 · `2xl` 22 · `3xl` 24 (kart, tab bar) · `panel` 26 · `4xl` 28 (hero) · `sheet` 30 · `full`.
- Ekran kenarı 20 px (`px-5`), üst = güvenli alan + 12; web'de 40 px ve en çok 1200 px (`Screen` template). 4'lük ızgara + yarım adımlar (`1.5`, `2.5`, `3.5`, `4.5`).
- Düğme yüksekliği: sm 44 · md 50 · lg 56 · xl 58 (`h-btn-*`); input 52 (`h-input`); dokunma alanı ≥ 44 px.

**Hareket — `src/core/motion`**

Her etkileşimli yüzey `PressableScale` (basınca .96, 150 ms, haptic). Girişler `EnterUp` / `EnterRight` (60 ms sıralı), geri bildirim `Pop`, `DrawCheck`, `Shake`; döngüler `PulseDot`, `Ring`, `Bell`, `Float`, `Orbit`, `Skeleton`. Tümü **azaltılmış harekete** uyar (döngü yok, giriş son karede). Reanimated `Animated.View`'a className verilmez (css-interop Reanimated bileşenlerini tanımıyor) — motion bileşenleri `className`'i dış View'a uygular.
**Müşteri kararı:** ücret düşüşü göstergesi (`bob` oku, `drain` çubuğu, "X saat sonra ₺…") hiçbir yerde yapılmaz.

**Gezinme**

Mobil: yüzen `TabBar` (surface, 1,5 px border, alttan 20, yanlardan 12, radius 24, h 72; aktif sekme 48×30 primary hap + kalın etiket). Web: `Sidebar` (248 px; ≤1100 px 84 px ikon rayı; ≤640 px üst menü; aktif öğe accent-soft; uzmanda alt bakiye kartı). İkisi de `src/app/(tabs)/_layout.tsx`'te role göre kurulur; sahneye sekme çubuğu kadar alt boşluk layout tarafından verilir. Geliştirme derlemesinde `/dev-gallery` tüm bileşenleri açık/koyu gösterir.

---

### 3. Domain Mimarisi

| Domain         | Sorumluluk                                     | Kritik Kurallar                                 |
| -------------- | ---------------------------------------------- | ----------------------------------------------- |
| `auth`         | Kayıt, giriş, token yönetimi, rol belirleme    | JWT refresh, role-based guard                   |
| `expert`       | Psikolog profili, lisans doğrulama, uzmanlık   | Profil yayınlanmadan önce admin onayı şart      |
| `client`       | Danışan profili, test geçmişi                  | Platform'a doğrudan kayıt olur                  |
| `listing`      | Danışan ilanları                               | OPEN→MATCHED→CLOSED/EXPIRED state machine       |
| `match`        | Eşleşme yönetimi                               | Yalnızca teklif kabulüyle oluşur                |
| `offer`        | Teklifler (ilan bazlı)                         | PENDING→ACCEPTED/REJECTED/WITHDRAWN             |
| `credit`       | Uzman kredisi: bakiye, defter, teklif maliyeti | Satın alma YALNIZ web sitesinde (mağaza kuralı) |
| `assessment`   | Psikolojik test modülü                         | Ücretsiz, auth gerektirmez                      |
| `notification` | Push, in-app, SMS bildirimleri                 | Event-driven, rate limited                      |

---

### 4. İş Kuralları (Değiştirilemez)

**İlan Kuralları:**

```
Durum makinesi: OPEN → MATCHED → (CLOSED | EXPIRED)

OPEN:    Danışan ilan açtı, tüm uzmanlar görebilir ve teklif gönderebilir.
MATCHED: Danışan bir teklifi kabul etti. Diğer PENDING teklifler otomatik REJECTED olur.
CLOSED:  Danışan ilanı manuel kapattı.
EXPIRED: 30 gün geçtikten sonra otomatik kapanır.

- Danışan aynı anda maksimum 3 OPEN ilan açabilir.
- MATCHED veya EXPIRED ilan yeniden açılamaz.
```

**Teklif Durum Makinesi:**

```
PENDING → ACCEPTED   (danışan kabul → match otomatik oluşur)
        → REJECTED   (danışan reddetti)
        → WITHDRAWN  (uzman geri çekti)

- Teklifler ilana gönderilir, danışana değil.
- Bir uzman aynı ilana sadece 1 teklif gönderebilir.
- Tek fiyat — kademe/dinamik fiyat sistemi yoktur.
- Uzman PENDING teklifini geri çekebilir (WITHDRAWN).
```

**Eşleşme Kuralları:**

```
Durum makinesi: ACTIVE → COMPLETED | RELEASED

- Eşleşme YALNIZCA teklif kabulüyle oluşur (otomatik).
- Eşleşme: danışan + uzman + ilan + kabul edilen teklif referansı içerir.
- RELEASED için her iki tarafın onayı gerekir (UX kuralı).
- Eşleşme backend kaynaklı — optimistic update yapılmaz.
```

**Kredi Kuralları (Armut modeli — backend `docs/PAYMENTS.md`):**

```
- Danışandan para alınmaz. Uzman ilana teklif GÖNDERİRKEN kredi harcar (offerCost).
- Harcanan kredi iade edilmez; başlangıç kredisi yoktur.
- Bakiye < offerCost ise teklif gönderimi kilitlenir; sunucu 422 INSUFFICIENT_CREDITS döner.
- Kredi YALNIZ web sitesinden alınır. Uygulamada satın alma butonu, bağlantı, adres,
  fiyat yoktur (App Store 3.1.1 / Play); yalnız düz metin:
  "Teklif göndermek için yeterli krediniz yok. Kredi yüklemek için web sitemizi ziyaret edin."
```

---

### 5. Screen & Navigation Haritası

**Tab Bar — Rol Bazlı (Armut Modeli)**

```
Uzman:   Fırsatlar | Tekliflerim | Eşleşmeler | Ayarlar   (web kenar çubuğu: + Bakiyem, alt bakiye kartı)
Danışan: Keşfet    | İlanlarım   | Eşleşmeler | Ayarlar   (web kenar çubuğu: + Yeni ilan, Bildirimler)
```

```
app/
  (auth)/
    login.tsx           → /login
    register.tsx        → /register (expert | client seçimi)
    onboarding/
      expert.tsx        → /onboarding/expert (profil tamamlama)
  (tabs)/
    index.tsx           → / — Expert: Fırsatlar (ilan feed + filtreler)
                              Client: Keşfet (popüler konular + uzmanlık alanı grid)
    offers.tsx          → /offers — Expert: Tekliflerim (gönderilen teklifler)
                                    Client: İlanlarım (Aktif/Geçmiş tab)
    matches.tsx         → /matches — Expert: Eşleşmelerim (Aktif/Geçmiş tab)
                                     Client: gizli (href: null)
    profile.tsx         → /profile — Ayarlar (rol bazlı menü)
  notifications.tsx     → /notifications — Bildirimler (tab dışı, header zil ikonundan erişilir)
  expert/
    [id].tsx            → /expert/[id] — uzman profil sayfası (public, okuma modu)
  client/
    [id].tsx            → /client/[id] — danışan profil (expert: okuma modu)
  listing/
    new.tsx             → /listing/new?spec=X — ilan oluştur (client, spec opsiyonel)
    [id].tsx            → /listing/[id] — ilan detay + gelen teklifler + Uzmanı İncele
  match/
    [id].tsx            → /match/[id] — eşleşme detay (expert only): danışan iletişim + ilan + teklif özeti
  offer/
    new.tsx             → /offer/new?listingId=X — teklif gönder (expert)
    [id].tsx            → /offer/[id] — teklif detay
  assessment/
    index.tsx           → /assessment — test başlangıç
    list.tsx            → /assessment/list — tüm testler + geçmiş sonuçlar
    result.tsx          → /assessment/result
  blog/
    index.tsx           → /blog — blog akışı
    [slug].tsx          → /blog/[slug] — blog detayı
  category/
    [slug].tsx          → /category/[slug] — kategori detayı (testler + blog + ilan CTA)
  credits/
    index.tsx           → /credits — kredi bakiyesi + geçmiş (expert only)
```

**Not — kök `store/`:** `onboardingStore` ve `themeStore` domain'e ait olmayan global UI state'leridir; kök `src/store/` altında tutulur. Domain'e özgü store'lar (örn. `authStore`) kendi domain klasöründe kalır.

**Not — backend sözleşmesi:** Frontend hiçbir iş mantığı hesaplamaz; sayaçlar, filtre/sıralama, maskeleme, göreli tarih ve türetilmiş alanlar backend'den gelir. Sözleşme: `docs/BACKEND_REQUIREMENTS.md`. Production temizlik adımları: `docs/PRODUCTION_CHECKLIST.md`.

---

### 6. API Sözleşmesi (Genel Yapı)

```typescript
// Tüm API yanıtları bu envelope yapısında gelir
type ApiResponse<T> = {
  data: T
  meta?: {
    page: number
    total: number
    perPage: number
  }
}

type ApiError = {
  code: string // 'MATCH_ALREADY_PENDING', 'OFFER_EXPIRED' gibi domain error code
  message: string // kullanıcıya gösterilebilir mesaj (TR)
  field?: string // validation error için hangi alan
}

// Axios interceptor'da global error handling:
// 401 → token refresh veya logout
// 403 → role-based guard (expert vs client)
// 422 → Zod ile form error mapping
// 429 → rate limit — backoff + toast
```

---

### 7. PsikoAl Komponent Kataloğu (v2)

Hepsi `@/core/components/{atoms,molecules,organisms,templates}` barrel'larından açılır; görsel doğrulama `/dev-gallery` (yalnız `__DEV__`).

**Atoms:** `Text` (variant: hero…overline; color: default/muted/brand/link/onPrimary/onAccent…/danger) · `Button` (primary · secondary · outline · link · danger · danger-outline; sm/md/lg/xl; disabled = kesikli çizgi; `isLoading` + `loadingLabel`; `icon`) · `IconButton` (outline/ghost/primary/surface, 44 daire, `badge`) · `Input` · `Checkbox` (çizilen tik) · `Switch` (46×26) · `FilterChip` (tek seçim) · `ChoiceChip` (çoklu, tik) · `TagChip` (meta) · `StatusPill` (live/soft/matched/neutral/danger) · `CountBadge` · `VerifiedBadge` · `StarRating` · `ProgressSegments` (bar/thin/dots) · `BudgetCells` · `ScoreRing` · `LevelBar` · `Avatar` (xs 30…hero 112, tone accent/primary/surface) · `Skeleton` · `Spinner` · `Icon` (Lucide) · `NavIcon` (tasarımın gezinme ikonları) · `BrandMark` · `Divider`. Eski: `Badge`, `Chip`, `DecorCircles` (@deprecated).

**Molecules:** `TextField` (text/email/tel/number/url/password; error/hint/optional) · `TextArea` (sayaç) · `ReadonlyField` (kesikli + kilit) · `Stepper` · `RadioCard` (large/list) · `SegmentedControl` (kayan hap) · `AvatarStack` · `InfoBanner` · `ReminderBanner` · `ErrorBanner` (alert + shake; satır içi / blok) · `EmptyState` (page/compact, yüzen illüstrasyon) · `ScreenHeader` · `SectionHeader` · `StrengthMeter` · `Accordion` / `AccordionItem` · `SettingsRow` + `SettingsGroup` · `TransactionRow` · `NotificationItem` · `StatTile` · `CheckboxRow`. Eski: `InputField`, `MenuRow`, `BackButton`, `ScreenTitle`, `StepProgress`, `ToggleRow`, `HeaderActions` (v2 karşılıkları yukarıda).

**Organisms:** `Select` (arama) · `CityPicker` (81 il — `@/core/constants`) · `ContactCard` (tel:/mailto:, kopyala→tik) · `SuccessHero` (halka + pop + tik, konfeti) · `HeroCard` (accent, dönen köşe dekoru) · `BottomSheet` · `Dialog` (web) · `ToastProvider` / `useToast` · `TabBar` · `Sidebar` + `SidebarBalanceCard` / `SidebarUserCard` / `useSidebarMode`. Eski: `BottomActionBar`, `HeroQuickActions`.

**Templates:** `AppProviders` (Toast dahil) · `Screen` (bg, kenar boşlukları, web'de en çok 1200 ortalı, `footer`, `keyboard`).

**Domain kartları** (`ListingCard`, `AdCard`, `OfferCard`, `MatchCard`, `TestCard`, `BlogCard`, `CreditBalanceCard`…) ilgili `domains/*/components` altında yukarıdaki parçalarla kurulur.

---

### 8. Geliştirici Notları (Önemli Edge Case'ler)

1. **Rol tabanlı tab bar:** `_layout.tsx`'de `role === 'expert'` kontrolü ile `matches` sekmesi expert'e gösterilir, client için `href: null` ile gizlenir.

2. **Teklif → Match otomasyonu:** Danışan bir teklifi kabul ettiğinde backend match'i otomatik oluşturur. `useAcceptOfferMutation` onSuccess'te `matchKeys.all` ve `listingKeys.detail(listingId)` invalidate eder. Optimistic update yapılmaz.

3. **Danışan adı gizliliği:** Listing kartlarında (uzman görünümünde) danışan adı tam gösterilmez. `formatClientName("Zeynep Yılmaz")` → `"Zeynep Y."` formatı. `domains/listing/utils/formatClientName.ts` helper'ı kullan.

4. **Danışan uzman araması YOKTUR:** Danışan "Keşfet" ekranında sadece kategori/konu seçer → bu seçim ilan oluşturma formunu açar. Uzman listesine doğrudan erişim yoktur. Danışan uzmanı pasif olarak görür: İlanlarım → İlan Detayı → Gelen Teklif → "Uzmanı İncele" → `/expert/[id]`.

5. **Assessment testi auth gerektirmez:** Bu route'lar `(auth)` grubunun dışında kalır. Test tamamlandıktan sonra email lead capture opsiyonel — zorlamaz.

6. **Ödeme yok:** Uygulamada ödeme akışı yoktur (eski cüzdan/paket/Iyzico modeli terk edildi). Uzman kredisi web sitesinden alınır; uygulama yalnız bakiye, geçmiş ve teklif maliyetini gösterir.

7. **Bildirim izni:** İlk login'de değil, ilk teklif geldiğinde sor. `expo-notifications` ile `PermissionStatus` kontrol et.

8. **Expert → client/[id] ekranı:** Uzman danışan profilini görüntüleyebilir (okuma modu). Bu ekranda "Teklif Gönder" butonu yoktur — uzman teklife ilan feed'inden (Fırsatlar) ulaşır.

9. **Teklif kabul onay uyarısı:** `OfferCard`'da danışan "Kabul Et" butonuna bastığında `Alert.alert` ile "İletişim bilgileriniz uzman ile paylaşılacaktır" uyarısı gösterilir. Onay durumunda `useAcceptOfferMutation` çalışır.

10. **Eşleşme detay sayfası (`/match/[id]`):** Expert-only. Eşleşme sonrası danışan adı **tam gösterilir** (gizleme yok), email ve telefon açık. `useMatchDetailQuery` → `GET /matches/:id` (embedded listing + offer döner).

11. **Eşleşmelerim → match detay:** Expert Eşleşmelerim sekmesinde eşleşmeye tıklamak `/match/[id]`'ye yönlendirir. "Eşleşmeyi Sonlandır" butonu bu tab ekranında yoktur.

12. **Tekliflerim — ACCEPTED teklif navigasyonu:** ACCEPTED teklif → `/match/[offer.matchId]`; PENDING/REJECTED/WITHDRAWN → `/offer/[id]`.

---

### 9. Senaryo: Yeni Özellik Eklerken Kontrol Listesi

Yeni bir özellik eklenirken sırayla şu soruları cevapla:

1. Bu hangi domain'e ait? (`match`, `offer`, `expert`...) → ilgili domain klasörüne git
2. Yeni bir Zod schema gerekiyor mu? → `domains/[x]/schemas/` klasörüne ekle
3. API çağrısı var mı? → TanStack Query hook yaz (`domains/[x]/api/`)
4. İş mantığı var mı? → Custom hook yaz (`domains/[x]/hooks/`)
5. UI var mı? → Component hangi atomic katmana ait? Core mu, domain-local mü?
6. Test yazdın mı? → Atom ise %100, hook ise %80
7. `index.ts` barrel güncelleneli mi? → Dışarıya açılacaksa evet

---

_Son güncelleme: Ekim 2026 — v2 "PsikoAl · Flat" tasarım sistemi (tokenlar, hareket, bileşen kataloğu)_
