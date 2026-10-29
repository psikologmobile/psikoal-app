/**
 * Geliştirici bileşen galerisi — YALNIZ geliştirme derlemesinde yüklenir
 * (src/app/dev-gallery.tsx `__DEV__` ile korur). Her v2 bileşenini ve
 * durumunu açık/koyu temada gösterir; ekran ajanları görsel doğrulama için
 * kullanır. Ürün kodu buradan import ETMEZ.
 */
import { useState } from 'react'
import type { ReactNode } from 'react'

import { ScrollView, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRouter } from 'expo-router'

import type { SemanticColorName } from '@/core/theme'
import type { ThemePreference } from '@/store/themeStore'

import {
  Avatar,
  BrandMark,
  BudgetCells,
  Button,
  Checkbox,
  ChoiceChip,
  CountBadge,
  FilterChip,
  IconButton,
  LevelBar,
  NavIcon,
  ProgressSegments,
  ScoreRing,
  Skeleton,
  SkeletonGroup,
  Spinner,
  StarRating,
  StatusPill,
  Switch,
  TagChip,
  Text,
  VerifiedBadge,
} from '@/core/components/atoms'
import {
  Accordion,
  AvatarStack,
  CheckboxRow,
  EmptyState,
  ErrorBanner,
  InfoBanner,
  NotificationItem,
  RadioCard,
  ReadonlyField,
  ReminderBanner,
  ScreenHeader,
  SectionHeader,
  SegmentedControl,
  SettingsGroup,
  SettingsRow,
  StatTile,
  Stepper,
  StrengthMeter,
  TextArea,
  TextField,
  TransactionRow,
} from '@/core/components/molecules'
import {
  BottomSheet,
  CityPicker,
  ContactCard,
  Dialog,
  HeroCard,
  Select,
  SidebarBalanceCard,
  SidebarUserCard,
  SuccessHero,
  useToast,
} from '@/core/components/organisms'
import {
  Bell,
  Confetti,
  CountRoll,
  EnterRight,
  EnterUp,
  Float,
  HeartBurst,
  Orbit,
  PressableScale,
  PulseDot,
  Ring,
  setReduceMotionOverride,
  Shake,
  useReduceMotion,
} from '@/core/motion'
import { semanticColors, useResolvedColorScheme, useThemeColors } from '@/core/theme'
import { useThemeStore } from '@/store/themeStore'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3 rounded-3xl border border-border p-4">
      <Text variant="overline" color="muted">
        {title}
      </Text>
      {children}
    </View>
  )
}

function Row({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap items-center gap-2">{children}</View>
}

const SWATCHES = Object.keys(semanticColors.light) as SemanticColorName[]

export function Gallery() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const colors = useThemeColors()
  const scheme = useResolvedColorScheme()
  const toast = useToast()
  const preference = useThemeStore((s) => s.preference)
  const setPreference = useThemeStore((s) => s.setPreference)
  const reduce = useReduceMotion()

  const [text, setText] = useState('Kaygı odaklı BDT')
  const [email, setEmail] = useState('zeynep@')
  const [pw, setPw] = useState('gizlisifre1')
  const [area, setArea] = useState('Son birkaç aydır uykusuzluk ve yoğun kaygı yaşıyorum.')
  const [checked, setChecked] = useState(true)
  const [sw, setSw] = useState(true)
  const [seg, setSeg] = useState('online')
  const [filter, setFilter] = useState('tum')
  const [choices, setChoices] = useState<string[]>(['Kaygı'])
  const [stars, setStars] = useState(4)
  const [years, setYears] = useState(6)
  const [role, setRole] = useState<'d' | 'u'>('d')
  const [meet, setMeet] = useState('online')
  const [city, setCity] = useState<string | null>(null)
  const [view, setView] = useState<string | null>('Açık')
  const [sheet, setSheet] = useState(false)
  const [dialog, setDialog] = useState(false)
  const [replay, setReplay] = useState(0)
  const [liked, setLiked] = useState(false)
  const [errKey, setErrKey] = useState(0)
  const [step, setStep] = useState(3)

  const toggleChoice = (c: string) =>
    setChoices((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="gap-4 px-5 pb-24">
      <View style={{ paddingTop: insets.top + 12 }} className="gap-3">
        <ScreenHeader
          title="Bileşen galerisi"
          eyebrow={`v2 · ${scheme === 'dark' ? 'koyu' : 'açık'} tema`}
          onBack={() => router.back()}
        />
        <SegmentedControl
          accessibilityLabel="Tema"
          options={[
            { value: 'light', label: 'Açık', icon: 'Sun' },
            { value: 'dark', label: 'Koyu', icon: 'Moon' },
            { value: 'system', label: 'Sistem' },
          ]}
          value={preference}
          onChange={(v) => setPreference(v as ThemePreference)}
        />
        <View className="flex-row items-center justify-between">
          <Text variant="bodySm">Hareketi azalt (önizleme)</Text>
          <Switch
            value={reduce}
            onValueChange={(v) => setReduceMotionOverride(v)}
            accessibilityLabel="Hareketi azalt"
          />
        </View>
      </View>

      <Section title="Renk tokenları">
        <View className="flex-row flex-wrap gap-2">
          {SWATCHES.map((k) => (
            <View key={k} className="w-[30%] gap-1">
              {/* REASON: örnek renk kutusu, değeri tokendan okunur */}
              <View
                style={{ backgroundColor: colors[k] }}
                className="h-10 rounded-sm border border-border"
              />
              <Text className="text-[11px] text-fg-muted">{k}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Tipografi">
        <Text variant="hero">Hero 44</Text>
        <Text variant="h1">H1 40</Text>
        <Text variant="h2">H2 34</Text>
        <Text variant="h3">H3 28</Text>
        <Text variant="sheet">Sheet 24</Text>
        <Text variant="title">Title 20</Text>
        <Text variant="number">₺1.250</Text>
        <Text variant="bodyLg">Gövde büyük 17</Text>
        <Text variant="body">Gövde 15 — Figtree 500</Text>
        <Text variant="bodySm" color="muted">
          Yardımcı 14 muted
        </Text>
        <Text variant="label">Etiket 13 / 700</Text>
        <Text variant="overline" color="brand">
          Overline 12
        </Text>
        <Text variant="body" color="link">
          Bağlantı rengi
        </Text>
        <BrandMark />
      </Section>

      <Section title="Button">
        <Row>
          <Button label="Primary" onPress={() => undefined} />
          <Button label="Secondary" variant="secondary" onPress={() => undefined} />
          <Button label="Outline" variant="outline" onPress={() => undefined} />
        </Row>
        <Row>
          <Button label="Danger" variant="danger" onPress={() => undefined} />
          <Button label="Danger outline" variant="danger-outline" onPress={() => undefined} />
          <Button label="Link" variant="link" onPress={() => undefined} />
        </Row>
        <Row>
          <Button label="Disabled" isDisabled onPress={() => undefined} />
          <Button label="Gönder" isLoading loadingLabel="Gönderiliyor…" onPress={() => undefined} />
        </Row>
        <Row>
          <Button label="sm" size="sm" icon="Plus" onPress={() => undefined} />
          <Button label="md" size="md" onPress={() => undefined} />
          <Button label="lg" size="lg" onPress={() => undefined} />
        </Row>
        <Button label="xl · tam genişlik" size="xl" fullWidth onPress={() => undefined} />
        <Row>
          <IconButton icon="ChevronLeft" accessibilityLabel="Geri" onPress={() => undefined} />
          <IconButton
            accessibilityLabel="Bildirimler"
            onPress={() => undefined}
            size="lg"
            badge={<CountBadge count={3} popDelay={1000} />}
          >
            <Bell>
              <NavIcon name="notifications" color={colors.text} size={22} />
            </Bell>
          </IconButton>
          <IconButton
            icon="X"
            variant="ghost"
            accessibilityLabel="Kapat"
            onPress={() => undefined}
          />
          <IconButton
            icon="Copy"
            size="sm"
            variant="ghost"
            accessibilityLabel="Kopyala"
            onPress={() => undefined}
          />
          <Spinner colorClassName="border-primary" />
        </Row>
      </Section>

      <Section title="Form">
        <TextField label="Ad" value={text} onChangeText={setText} />
        <TextField
          label="E-posta"
          type="email"
          value={email}
          onChangeText={setEmail}
          error="Geçerli bir e-posta yaz."
        />
        <TextField label="Şifre" type="password" value={pw} onChangeText={setPw} />
        <StrengthMeter score={3} label="Güçlü · en az 8 karakter" />
        <TextField
          label="Telefon"
          optional
          type="tel"
          value=""
          onChangeText={() => undefined}
          placeholder="0500 000 00 00"
        />
        <TextField
          label="Kilitli"
          value="Değiştirilemez"
          onChangeText={() => undefined}
          isDisabled
        />
        <TextArea
          label="İlan açıklaması"
          value={area}
          onChangeText={setArea}
          maxLength={300}
          minLength={20}
        />
        <ReadonlyField
          label="E-posta"
          value="zeynep@ornek.com"
          hint="Giriş kimliğin olduğu için değiştirilemez."
        />
        <CityPicker value={city} onChange={setCity} optional />
        <Select
          label="Görünüm"
          value={view}
          options={['Açık', 'Koyu', 'Sistem']}
          onChange={setView}
          size="md"
        />
        <Stepper
          label="Deneyim yılı"
          value={years}
          onChange={setYears}
          min={0}
          max={50}
          unit="yıl"
        />
        <Row>
          <Checkbox checked={checked} onChange={setChecked} accessibilityLabel="Örnek onay" />
          <Checkbox
            checked={false}
            onChange={() => undefined}
            hasError
            accessibilityLabel="Hatalı onay"
          />
          <Checkbox checked={false} onChange={() => undefined} accessibilityLabel="Boş onay" />
          <Switch value={sw} onValueChange={setSw} accessibilityLabel="Yalnız davetler" />
          <Switch value={false} onValueChange={() => undefined} isDisabled />
        </Row>
        <CheckboxRow
          checked={checked}
          onToggle={() => setChecked((c) => !c)}
          accessibilityLabel="Koşullar"
        >
          Kullanım Koşulları ve Gizlilik Politikası'nı okudum, kabul ediyorum.
        </CheckboxRow>
      </Section>

      <Section title="Seçim">
        <View accessibilityRole="radiogroup" className="gap-3">
          <RadioCard
            variant="large"
            mark="D"
            title="Danışan"
            description="Destek almak istiyorum"
            selected={role === 'd'}
            onPress={() => setRole('d')}
          />
          <RadioCard
            variant="large"
            mark="U"
            title="Uzman"
            description="Psikolog olarak teklif vereceğim"
            selected={role === 'u'}
            onPress={() => setRole('u')}
          />
        </View>
        <View accessibilityRole="radiogroup" className="gap-2">
          {['online', 'yuz'].map((m) => (
            <RadioCard
              key={m}
              title={m === 'online' ? 'Online' : 'Yüz yüze'}
              description={m === 'online' ? 'Görüntülü görüşme' : 'Ofiste'}
              selected={meet === m}
              onPress={() => setMeet(m)}
            />
          ))}
        </View>
        <SegmentedControl
          accessibilityLabel="Görüşme şekli"
          options={[
            { value: 'online', label: 'Online' },
            { value: 'yuz', label: 'Yüz yüze' },
            { value: 'iki', label: 'İkisi de' },
          ]}
          value={seg}
          onChange={setSeg}
        />
        <Row>
          {[
            ['tum', 'Tümü'],
            ['yayin', 'Yayında'],
            ['eslesti', 'Eşleşti'],
          ].map(([k, l]) => (
            <FilterChip
              key={k}
              label={l ?? ''}
              selected={filter === k}
              onPress={() => setFilter(k ?? '')}
              count={k === 'yayin' ? 2 : undefined}
            />
          ))}
        </Row>
        <Row>
          {['Kaygı', 'Depresyon', 'İlişki'].map((c) => (
            <ChoiceChip
              key={c}
              label={c}
              selected={choices.includes(c)}
              onPress={() => toggleChoice(c)}
            />
          ))}
        </Row>
        <StarRating value={stars} onChange={setStars} />
      </Section>

      <Section title="Rozet ve durum">
        <Row>
          <StatusPill label="Yayında" variant="live" />
          <StatusPill label="Onay bekliyor" variant="soft" />
          <StatusPill label="Eşleşti" variant="matched" />
          <StatusPill label="Süresi doldu" variant="neutral" />
          <StatusPill label="Reddedildi" variant="danger" />
          <CountBadge count={3} />
          <CountBadge count={128} />
        </Row>
        <Row>
          <TagChip label="Online" icon="Video" />
          <TagChip label="₺1.500–2.500" tone="surface" />
          <TagChip label="Kaygı" tone="accent" />
          <VerifiedBadge size={20} />
          <VerifiedBadge size={32} />
        </Row>
        <Row>
          <Avatar size="xs" initials="ZY" />
          <Avatar size="sm" initials="EK" tone="primary" />
          <Avatar size="md" initials="ZY" />
          <Avatar size="lg" initials="EK" tone="primary" isVerified />
          <Avatar size="xl" initials="ZY" />
          <Avatar size="2xl" initials="EK" tone="surface" />
        </Row>
        <AvatarStack
          avatars={[
            { initials: 'EK' },
            { initials: 'MA', tone: 'primary' },
            { initials: 'SD' },
            { initials: 'TT' },
            { initials: 'BK' },
          ]}
          max={3}
        />
      </Section>

      <Section title="Bannerlar">
        <InfoBanner>İletişim bilgilerin yalnız eşleştiğin uzmanla paylaşılır.</InfoBanner>
        <ReminderBanner
          primaryLabel="İlanıma git"
          onPrimary={() => undefined}
          secondaryLabel="Anlaşmadım"
          onSecondary={() => undefined}
        >
          Uzm. Psk. Elif Kaya seninle anlaştığını bildirdi.
        </ReminderBanner>
        <ErrorBanner message="E-posta ya da şifre hatalı." shakeKey={errKey} />
        <Button
          label="Hatayı tekrar salla"
          variant="outline"
          size="sm"
          onPress={() => setErrKey((k) => k + 1)}
        />
        <ErrorBanner
          title="Bağlantı kurulamadı"
          description="İnternetini kontrol edip tekrar dene."
          onRetry={() => undefined}
        />
      </Section>

      <Section title="İlerleme ve skor">
        <ProgressSegments total={7} current={step} />
        <Row>
          <Button
            label="−"
            size="sm"
            variant="outline"
            onPress={() => setStep((s) => Math.max(0, s - 1))}
          />
          <Button
            label="+"
            size="sm"
            variant="outline"
            onPress={() => setStep((s) => Math.min(7, s + 1))}
          />
          <ProgressSegments total={4} current={2} variant="dots" />
        </Row>
        <BudgetCells from={2} to={5} />
        <View className="flex-row items-center gap-4">
          <ScoreRing value={14} max={21}>
            <Text variant="h2">14</Text>
            <Text className="text-xs text-fg-muted">/ 21 puan</Text>
          </ScoreRing>
          <LevelBar position={0.5} className="flex-1" />
        </View>
      </Section>

      <Section title="Kart ve satırlar">
        <HeroCard
          eyebrow="Bugün"
          title="Nasıl bir destek arıyorsun?"
          actionLabel="Yeni ilan aç"
          onAction={() => undefined}
          note="3 hakkın var"
        />
        <HeroCard title="Bakiye" decor="orbit" eyebrow="Kullanılabilir bakiye">
          <CountRoll value="₺1.250" className="font-display text-6xl text-accent-fg" offset={48} />
        </HeroCard>
        <View className="flex-row gap-2">
          <StatTile label="Açık ilan" value={24} />
          <StatTile label="Teklifin" value={7} tone="accent" delay={120} />
          <StatTile label="Eşleşme" value={3} tone="outline" delay={240} />
        </View>
        <SectionHeader title="Aktif ilanın" actionLabel="Tümü" onAction={() => undefined} />
        <SettingsGroup title="Hesap">
          <SettingsRow icon="User" label="Kişisel bilgiler" onPress={() => undefined} />
          <SettingsRow
            icon="Lock"
            label="Şifre ve gizlilik"
            hint="Güçlü"
            onPress={() => undefined}
          />
          <SettingsRow
            icon="Bell"
            label="Bildirimler"
            right={<Switch value onValueChange={() => undefined} />}
            isLast
          />
        </SettingsGroup>
        <View>
          <TransactionRow
            direction="in"
            title="Bakiye yükleme"
            description="Web sitesi · kart"
            amount="+₺500"
            after="Bakiye ₺1.250"
          />
          <TransactionRow
            direction="out"
            title="Teklif ücreti"
            description="Kaygı ve uyku sorunları"
            amount="−₺125"
            after="Bakiye ₺750"
            isLast
          />
        </View>
        <NotificationItem
          title="Yeni teklif"
          body="Uzm. Psk. Elif Kaya ilanına teklif verdi."
          time="2 sa önce"
          icon="Send"
          priority="high"
          unread
          onPress={() => undefined}
        />
        <NotificationItem
          title="İlanın onaylandı"
          body="İlanın yayında."
          time="dün"
          icon="Check"
          onPress={() => undefined}
        />
        <ContactCard
          phone="0500 000 00 00"
          email="zeynep@ornek.com"
          header={
            <View className="flex-row items-center gap-3.5">
              <Avatar size="xl" initials="ZY" tone="primary" />
              <View className="flex-1">
                <Text className="font-body-bold text-lg text-accent-soft-fg">Zeynep Yılmaz</Text>
                <Text className="text-label text-accent-soft-fg">Danışan · Kaygı</Text>
              </View>
            </View>
          }
        />
        <Accordion
          items={[
            {
              id: '1',
              title: 'Psikosirius ücretli mi?',
              content: 'Danışanlar için ücretsiz; uzmanlar teklif gönderirken kredi kullanır.',
            },
            {
              id: '2',
              title: 'Nasıl eşleşirim?',
              content: 'İlanına gelen bir teklifi kabul ettiğinde eşleşirsin.',
            },
          ]}
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <SidebarBalanceCard
              balanceLabel="₺1.250"
              note="2 ücretsiz teklif hakkı"
              onAction={() => undefined}
            />
          </View>
          <View className="flex-1">
            <SidebarUserCard initials="Z" name="Zeynep Yılmaz" roleLabel="Danışan" />
          </View>
        </View>
      </Section>

      <Section title="Boş ve yükleniyor">
        <EmptyState
          variant="compact"
          icon="Plus"
          title="Henüz ilanın yok"
          description="İlk ilanını aç, uzmanlar sana tekliflerini göndersin."
        />
        <EmptyState
          icon="Inbox"
          title="Henüz teklif yok"
          description="Uzmanlar ilanını inceliyor."
          ctaLabel="İlanı düzenle"
          onCta={() => undefined}
          className="py-6"
        />
        <SkeletonGroup>
          <Skeleton variant="line" width="70%" />
          <Skeleton variant="rect" height={60} delay={150} />
          <View className="flex-row gap-3">
            <Skeleton variant="circle" height={44} delay={300} />
            <Skeleton variant="line" width="50%" delay={450} />
          </View>
        </SkeletonGroup>
      </Section>

      <Section title="Kaplamalar">
        <Row>
          <Button label="BottomSheet" variant="outline" onPress={() => setSheet(true)} />
          <Button label="Dialog (web)" variant="outline" onPress={() => setDialog(true)} />
          <Button
            label="Toast"
            variant="outline"
            onPress={() => toast.show('Bilgilerin kaydedildi')}
          />
          <Button
            label="Hata toast"
            variant="danger-outline"
            onPress={() => toast.show('Kaydedilemedi', { kind: 'error' })}
          />
        </Row>
      </Section>

      <Section title="Hareket">
        <Button
          label="Tekrar oynat"
          variant="secondary"
          size="sm"
          onPress={() => setReplay((r) => r + 1)}
        />
        <View className="relative h-64 overflow-hidden rounded-2xl bg-surface">
          <Confetti runKey={replay} delay={200} />
          <View className="flex-1 items-center justify-center gap-3">
            <View className="h-24 w-24 items-center justify-center">
              <View className="absolute inset-0">
                <Ring size={96} />
              </View>
              <Orbit duration={10000} className="absolute inset-0">
                <View className="h-24 w-24 rounded-full border border-dashed border-accent-line" />
              </Orbit>
              <Float>
                <Avatar size="xl" initials="ZY" />
              </Float>
            </View>
            <EnterUp replayKey={replay}>
              <Text variant="title">enter-up</Text>
            </EnterUp>
            <EnterRight replayKey={replay}>
              <Text variant="bodySm" color="muted">
                enter-right
              </Text>
            </EnterRight>
          </View>
        </View>
        <Row>
          <PulseDot size={12} />
          <Shake trigger={replay} onMount={false}>
            <StatusPill label="shake" variant="danger" />
          </Shake>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Beğen"
            onPress={() => setLiked((l) => !l)}
            className="p-2"
          >
            <HeartBurst liked={liked} color={colors.primary} idleColor={colors.textMuted} />
          </PressableScale>
        </Row>
        <SuccessHero
          key={replay}
          title="Teklifin gönderildi"
          description="Danışan teklifini gördüğünde bildirim alacaksın."
          loopRing={false}
        />
      </Section>

      <BottomSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title="Çıkış yapılsın mı?"
        description="Tekrar giriş yaptığında her şey kaldığın yerde olacak."
        actions={
          <View className="flex-row gap-2.5">
            <Button
              label="Vazgeç"
              variant="outline"
              size="lg"
              fullWidth
              onPress={() => setSheet(false)}
              className="flex-1"
            />
            <Button
              label="Çıkış yap"
              variant="danger"
              size="lg"
              fullWidth
              onPress={() => setSheet(false)}
            />
          </View>
        }
      />
      <Dialog
        visible={dialog}
        onClose={() => setDialog(false)}
        title="İlanı kapat"
        description="Kapatılan ilan yeniden açılamaz."
        actions={
          <Button label="Kapat" variant="danger" fullWidth onPress={() => setDialog(false)} />
        }
      />
    </ScrollView>
  )
}
