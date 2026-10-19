# core/

Projeler arası taşınabilir atomic design katmanı. Domain bilgisi içermez; yalnızca görünüm, tema, hareket ve saf yardımcılar barındırır. Tasarım kaynağı: `docs/design-v2/` (v2 "PsikoAl · Flat").

## Yapı

```
core/
  components/
    atoms/        Text, Button, IconButton, Input, Checkbox, Switch, FilterChip, ChoiceChip,
                  TagChip, StatusPill, CountBadge, VerifiedBadge, StarRating, ProgressSegments,
                  BudgetCells, ScoreRing, LevelBar, Avatar, Skeleton, Spinner, Icon, NavIcon,
                  BrandMark, Divider, AppRefreshControl
    molecules/    TextField, TextArea, ReadonlyField, Stepper, RadioCard, SegmentedControl,
                  AvatarStack, InfoBanner, ReminderBanner, ErrorBanner, EmptyState, ScreenHeader,
                  SectionHeader, StrengthMeter, Accordion, SettingsRow/SettingsGroup,
                  TransactionRow, NotificationItem, StatTile, CheckboxRow
    organisms/    Select, CityPicker, ContactCard, SuccessHero, HeroCard, BottomSheet, Dialog,
                  Toast (ToastProvider/useToast), TabBar, Sidebar
    templates/    AppProviders, Screen
  constants/      TURKEY_PROVINCES (81 il), normalizeTr
  motion/         PressableScale, EnterUp/Right, Pop, DrawCheck, Shake, PulseDot, Ring, Bell,
                  Float, Breathe, Orbit, Spin, Wobble, CountRoll, Fill, Confetti, HeartBurst,
                  CopyTick, TypeReveal, Flash, Coin, Radar, usePresence, useReduceMotion, haptic
  hooks/          useRefresh, useCopyToClipboard
  theme/          tokens.ts (renk/font/tip/köşe/boşluk/ölçü/hareket — TEK kaynak),
                  palette.ts (useThemeColors), useApplyThemePreference
  utils/          cn (tailwind-merge özel ölçeklerle), formatDate, personName
```

## Kurallar

- Import yönü: Atom → Molecule → Organism → Template. Geriye doğru import yasak. `motion`, `theme`, `constants`, `utils` her katmandan kullanılabilir.
- Her bileşen kendi klasöründe `Bileşen.tsx + index.ts (+ test)` ile yaşar; dışarıya katman barrel'ından açılır.
- Stil yalnızca NativeWind semantik sınıflarıyla (`bg-surface`, `text-fg-muted`, `border-border-strong` …) yazılır; `dark:` öneki gerekmez. className kabul etmeyen prop'larda `useThemeColors()`.
- Gölge ve gradyan yasak; derinlik surface tonu + 1,5 px çizgi.
- Reanimated `Animated.View`'a className verilmez; hareket için `@/core/motion` bileşenleri kullanılır, hepsi azaltılmış harekete uyar.
- Görsel doğrulama: geliştirme derlemesinde `/dev-gallery`.
