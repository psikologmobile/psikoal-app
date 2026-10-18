import { Text } from 'react-native'

import { fireEvent, render } from '@testing-library/react-native'

import { AccordionItem, Accordion } from './Accordion'
import { AvatarStack } from './AvatarStack'
import { EmptyState } from './EmptyState'
import { NotificationItem } from './NotificationItem'
import { ReadonlyField } from './ReadonlyField'
import { ScreenHeader } from './ScreenHeader'
import { SectionHeader } from './SectionHeader'
import { SettingsGroup, SettingsRow } from './SettingsRow'
import { StatTile } from './StatTile'
import { StrengthMeter } from './StrengthMeter'
import { TransactionRow } from './TransactionRow'

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }))

describe('SettingsRow / SettingsGroup', () => {
  it('renders a pressable row with hint and chevron', () => {
    const onPress = jest.fn()
    const { getByLabelText } = render(
      <SettingsGroup title="Hesap">
        <SettingsRow icon="User" label="Kişisel bilgiler" hint="Zeynep" onPress={onPress} />
        <SettingsRow icon="Trash2" label="Hesabı sil" danger isLast onPress={jest.fn()} />
      </SettingsGroup>
    )
    fireEvent.press(getByLabelText('Kişisel bilgiler, Zeynep'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('renders a static row with a custom right element', () => {
    const { getByText } = render(<SettingsRow label="Bildirimler" right={<Text>sağ</Text>} />)
    expect(getByText('sağ')).toBeTruthy()
  })
})

describe('TransactionRow', () => {
  it('renders in and out rows', () => {
    const { getByText, rerender } = render(
      <TransactionRow direction="in" title="Bakiye yükleme" amount="+₺500" after="Bakiye ₺1.250" />
    )
    expect(getByText('+₺500').props.className).toContain('text-primary-text')
    rerender(
      <TransactionRow
        direction="out"
        title="Teklif"
        description="Kaygı ilanı"
        amount="−₺125"
        isLast
      />
    )
    expect(getByText('−₺125').props.className).toContain('text-fg')
  })
})

describe('NotificationItem', () => {
  it('renders unread high priority item and handles press', () => {
    const onPress = jest.fn()
    const { getByRole } = render(
      <NotificationItem
        title="Yeni teklif"
        body="Elif Kaya teklif verdi"
        time="2 sa"
        icon="Send"
        priority="high"
        unread
        onPress={onPress}
      />
    )
    const btn = getByRole('button')
    expect(btn.props.className).toContain('bg-accent-soft')
    fireEvent.press(btn)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('renders a read, static item', () => {
    const { getByText } = render(<NotificationItem title="Hatırlatma" time="dün" icon="Bell" />)
    expect(getByText('Hatırlatma')).toBeTruthy()
  })
})

describe('StatTile', () => {
  it('renders animated and static values in every tone', () => {
    const tones = ['surface', 'accent', 'outline'] as const
    tones.forEach((tone) => {
      const { getByLabelText, unmount } = render(
        <StatTile label="Teklif" value={12} tone={tone} animate={tone !== 'outline'} />
      )
      expect(getByLabelText('Teklif: 12')).toBeTruthy()
      unmount()
    })
  })
})

describe('StrengthMeter', () => {
  it('renders the label colored by score', () => {
    const { getByText, rerender } = render(<StrengthMeter score={3} label="Güçlü" />)
    expect(getByText('Güçlü').props.className).toContain('text-primary-text')
    rerender(<StrengthMeter score={1} label="Zayıf" />)
    expect(getByText('Zayıf').props.className).toContain('text-fg-muted')
    rerender(<StrengthMeter score={9} />)
  })
})

describe('Accordion', () => {
  it('opens one item at a time and toggles', () => {
    const { getByLabelText, queryByText } = render(
      <Accordion
        items={[
          { id: 'a', title: 'Ücretli mi?', content: 'Danışan için ücretsiz.' },
          { id: 'b', title: 'Nasıl eşleşirim?', content: 'Teklif kabulüyle.' },
        ]}
      />
    )
    fireEvent.press(getByLabelText('Ücretli mi?'))
    expect(queryByText('Danışan için ücretsiz.')).toBeTruthy()
    fireEvent.press(getByLabelText('Nasıl eşleşirim?'))
    expect(queryByText('Danışan için ücretsiz.')).toBeNull()
    fireEvent.press(getByLabelText('Nasıl eşleşirim?'))
    expect(queryByText('Teklif kabulüyle.')).toBeNull()
  })

  it('supports uncontrolled items with custom content and multi mode', () => {
    const { getByText } = render(
      <>
        <AccordionItem title="Açık" defaultOpen>
          <Text>özel</Text>
        </AccordionItem>
        <Accordion single={false} items={[{ id: 'x', title: 'Çoklu', content: 'içerik' }]} />
      </>
    )
    expect(getByText('özel')).toBeTruthy()
  })
})

describe('ScreenHeader', () => {
  it('renders back button, eyebrow and right slot', () => {
    const onBack = jest.fn()
    const { getByLabelText, getByText } = render(
      <ScreenHeader title="Eşleşme" eyebrow="Detay" onBack={onBack} right={<Text>durum</Text>} />
    )
    fireEvent.press(getByLabelText('Geri'))
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(getByText('durum')).toBeTruthy()
  })

  it('renders close and tab variants', () => {
    const { getByLabelText, queryByLabelText, rerender } = render(
      <ScreenHeader title="İlan oluştur" leading="close" />
    )
    fireEvent.press(getByLabelText('Kapat'))
    rerender(<ScreenHeader title="Ayarlar" size="tab" />)
    expect(queryByLabelText('Geri')).toBeNull()
  })
})

describe('SectionHeader', () => {
  it('renders title and action link', () => {
    const onAction = jest.fn()
    const { getByLabelText, rerender, getByText } = render(
      <SectionHeader title="Aktif ilanın" actionLabel="Tümü" onAction={onAction} />
    )
    fireEvent.press(getByLabelText('Tümü'))
    expect(onAction).toHaveBeenCalled()
    rerender(<SectionHeader title="Hesap" variant="overline" />)
    expect(getByText('Hesap')).toBeTruthy()
  })
})

describe('ReadonlyField', () => {
  it('announces the locked value', () => {
    const { getByLabelText, getByText } = render(
      <ReadonlyField label="E-posta" value="zeynep@ornek.com" hint="Değiştirilemez." />
    )
    expect(getByLabelText('E-posta: zeynep@ornek.com, değiştirilemez')).toBeTruthy()
    expect(getByText('Değiştirilemez.')).toBeTruthy()
  })
})

describe('AvatarStack', () => {
  it('shows overflow count', () => {
    const { getByText, getByLabelText } = render(
      <AvatarStack avatars={[{ initials: 'A' }, { initials: 'B' }, { initials: 'C' }]} max={2} />
    )
    expect(getByText('+1')).toBeTruthy()
    expect(getByLabelText('3 kişi')).toBeTruthy()
  })
})

describe('EmptyState', () => {
  it('renders page variant with actions', () => {
    const onCta = jest.fn()
    const onSecondary = jest.fn()
    const { getByLabelText } = render(
      <EmptyState
        title="Henüz ilan yok"
        description="İlk ilanını aç."
        ctaLabel="Yeni ilan aç"
        onCta={onCta}
        secondaryLabel="Testlere göz at"
        onSecondary={onSecondary}
      />
    )
    fireEvent.press(getByLabelText('Yeni ilan aç'))
    fireEvent.press(getByLabelText('Testlere göz at'))
    expect(onCta).toHaveBeenCalled()
    expect(onSecondary).toHaveBeenCalled()
  })

  it('renders compact variant and custom illustration', () => {
    const { getByText, rerender } = render(
      <EmptyState variant="compact" title="Henüz ilanın yok" description="Aç." />
    )
    expect(getByText('Henüz ilanın yok')).toBeTruthy()
    rerender(<EmptyState title="Boş" illustration={<Text>art</Text>} />)
    expect(getByText('art')).toBeTruthy()
  })
})
