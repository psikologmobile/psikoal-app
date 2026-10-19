import { Pressable, Text } from 'react-native'

import { act, fireEvent, render, waitFor } from '@testing-library/react-native'

import * as Clipboard from 'expo-clipboard'

import { BottomSheet } from './BottomSheet'
import { CityPicker } from './CityPicker'
import { ContactCard } from './ContactCard'
import { Dialog } from './Dialog'
import { HeroCard } from './HeroCard'
import { Select } from './Select'
import { SuccessHero } from './SuccessHero'
import { TabBar } from './TabBar'
import { ToastProvider, useToast } from './Toast'

import type { BottomTabBarProps } from 'expo-router/js-tabs'

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
)
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(() => Promise.resolve(true)) }))

describe('Select / CityPicker', () => {
  it('opens, filters with Turkish-insensitive search and picks', () => {
    const onChange = jest.fn()
    const { getByLabelText, getByText, queryByText, getByPlaceholderText } = render(
      <CityPicker value={null} onChange={onChange} />
    )
    fireEvent.press(getByLabelText('Şehir: Şehir seç'))
    fireEvent.changeText(getByPlaceholderText('İl ara'), 'sanli')
    expect(getByText('Şanlıurfa')).toBeTruthy()
    expect(queryByText('Adana')).toBeNull()
    fireEvent.press(getByLabelText('Şanlıurfa'))
    expect(onChange).toHaveBeenCalledWith('Şanlıurfa')
  })

  it('shows the empty text when nothing matches', () => {
    const { getByLabelText, getByPlaceholderText, getByText } = render(
      <CityPicker value="Konya" onChange={jest.fn()} />
    )
    fireEvent.press(getByLabelText('Şehir: Konya'))
    fireEvent.changeText(getByPlaceholderText('İl ara'), 'xyz')
    expect(getByText('Bu adla bir il yok')).toBeTruthy()
  })

  it('renders a plain select with object options and error', () => {
    const onChange = jest.fn()
    const { getByLabelText, getByText } = render(
      <Select
        label="Görünüm"
        value="a"
        options={[
          { value: 'a', label: 'Açık' },
          { value: 'b', label: 'Koyu' },
        ]}
        onChange={onChange}
        error="Seçim gerekli"
        size="md"
        optional
      />
    )
    expect(getByText('Seçim gerekli')).toBeTruthy()
    fireEvent.press(getByLabelText('Görünüm: Açık'))
    fireEvent.press(getByLabelText('Koyu'))
    expect(onChange).toHaveBeenCalledWith('b')
  })
})

describe('ContactCard', () => {
  it('copies the phone number and shows the tick', async () => {
    const { getByLabelText } = render(
      <ContactCard phone="0500 000 00 00" email="zeynep@ornek.com" header={<Text>Zeynep</Text>} />
    )
    await act(async () => {
      fireEvent.press(getByLabelText('Telefonu kopyala'))
    })
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('0500 000 00 00')
    await waitFor(() => expect(getByLabelText('Telefonu kopyalandı')).toBeTruthy())
    expect(getByLabelText('Ara: 0500 000 00 00')).toBeTruthy()
    expect(getByLabelText('E-posta gönder: zeynep@ornek.com')).toBeTruthy()
  })

  it('renders with email only', () => {
    const { queryByLabelText } = render(<ContactCard email="a@b.co" footer={<Text>alt</Text>} />)
    expect(queryByLabelText(/^Ara/)).toBeNull()
  })
})

describe('Toast', () => {
  function Trigger() {
    const toast = useToast()
    return (
      <>
        <Pressable accessibilityRole="button" onPress={() => toast.show('Bilgilerin kaydedildi')}>
          <Text>göster</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => toast.show('Hata oldu', { kind: 'error', duration: 1000 })}
        >
          <Text>hata</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => toast.hide()}>
          <Text>gizle</Text>
        </Pressable>
      </>
    )
  }

  it('shows and hides a toast', () => {
    jest.useFakeTimers()
    const { getByText, queryByText } = render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    )
    fireEvent.press(getByText('göster'))
    expect(getByText('Bilgilerin kaydedildi')).toBeTruthy()
    fireEvent.press(getByText('hata'))
    expect(getByText('Hata oldu')).toBeTruthy()
    act(() => {
      jest.advanceTimersByTime(1100)
    })
    expect(queryByText('Hata oldu')).toBeNull()
    fireEvent.press(getByText('göster'))
    fireEvent.press(getByText('gizle'))
    expect(queryByText('Bilgilerin kaydedildi')).toBeNull()
    jest.useRealTimers()
  })

  it('is a no-op outside the provider', () => {
    const { getByText } = render(<Trigger />)
    fireEvent.press(getByText('göster'))
  })
})

describe('BottomSheet / Dialog', () => {
  it('renders sheet content and closes from the scrim', () => {
    const onClose = jest.fn()
    const { getByText, getAllByLabelText, rerender, queryByText } = render(
      <BottomSheet
        visible
        onClose={onClose}
        title="Çıkış yapılsın mı?"
        description="Tekrar giriş yaptığında…"
        actions={<Text>eylem</Text>}
      >
        <Text>gövde</Text>
      </BottomSheet>
    )
    expect(getByText('Çıkış yapılsın mı?')).toBeTruthy()
    expect(getByText('eylem')).toBeTruthy()
    fireEvent.press(getAllByLabelText('Kapat')[0]!)
    expect(onClose).toHaveBeenCalled()
    rerender(<BottomSheet visible={false} onClose={onClose} title="Çıkış yapılsın mı?" />)
    expect(queryByText('Çıkış yapılsın mı?')).toBeNull()
  })

  it('renders a dialog with close button', () => {
    const onClose = jest.fn()
    const { getAllByLabelText, getByText } = render(
      <Dialog
        visible
        onClose={onClose}
        title="Teklif gönderildi"
        description="Açıklama"
        actions={<Text>tamam</Text>}
      >
        <Text>içerik</Text>
      </Dialog>
    )
    expect(getByText('içerik')).toBeTruthy()
    getAllByLabelText('Kapat').forEach((el) => fireEvent.press(el))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders a non-dismissable dialog without title', () => {
    const { toJSON } = render(
      <Dialog visible onClose={jest.fn()} dismissable={false} showClose={false} />
    )
    expect(toJSON()).toBeTruthy()
  })
})

describe('SuccessHero / HeroCard', () => {
  it('renders hero variants', () => {
    const { getByText, rerender } = render(
      <SuccessHero
        title="Teklifin gönderildi"
        description="Danışan görecek."
        confetti={6}
        loopRing={false}
      >
        <Text>iletişim</Text>
      </SuccessHero>
    )
    expect(getByText('Teklifin gönderildi')).toBeTruthy()
    rerender(
      <SuccessHero
        title="E-postanı kontrol et"
        icon="Mail"
        tone="primary"
        size="md"
        description={<Text>özel</Text>}
      />
    )
    expect(getByText('özel')).toBeTruthy()
  })

  it('renders hero card with action and orbit decor', () => {
    const onAction = jest.fn()
    const { getByLabelText, getByText, rerender } = render(
      <HeroCard
        eyebrow="Bugün"
        title="Nasıl bir destek arıyorsun?"
        actionLabel="Yeni ilan aç"
        onAction={onAction}
        note="3 hak"
      />
    )
    fireEvent.press(getByLabelText('Yeni ilan aç'))
    expect(onAction).toHaveBeenCalled()
    rerender(
      <HeroCard title="Bakiye" decor="orbit">
        <Text>₺1.250</Text>
      </HeroCard>
    )
    expect(getByText('₺1.250')).toBeTruthy()
  })
})

describe('TabBar', () => {
  function makeProps(index: number) {
    const emit = jest.fn(() => ({ defaultPrevented: false }))
    const navigate = jest.fn()
    const routes = ['index', 'offers', 'hidden'].map((name) => ({
      key: `${name}-k`,
      name,
      params: undefined,
    }))
    const descriptors = Object.fromEntries(
      routes.map((r) => [
        r.key,
        {
          options: {
            title: r.name === 'index' ? 'Keşfet' : 'İlanlarım',
            href: r.name === 'hidden' ? null : undefined,
            tabBarBadge: r.name === 'offers' ? 2 : undefined,
            tabBarIcon: () => <Text>ikon</Text>,
          },
        },
      ])
    )
    const props = {
      state: { index, routes },
      descriptors,
      navigation: { emit, navigate },
      insets: { top: 0, bottom: 0, left: 0, right: 0 },
    } as unknown as BottomTabBarProps // REASON: test için asgari navigator nesnesi
    return { props, emit, navigate }
  }

  it('renders visible tabs and navigates on press', () => {
    const { props, navigate, emit } = makeProps(0)
    const { getAllByRole, getByLabelText } = render(<TabBar {...props} />)
    expect(getAllByRole('tab')).toHaveLength(2)
    expect(getAllByRole('tab')[0]?.props.accessibilityState).toEqual({ selected: true })
    fireEvent.press(getByLabelText('İlanlarım, 2 yeni'))
    expect(navigate).toHaveBeenCalledWith('offers', undefined)
    fireEvent(getByLabelText('Keşfet'), 'longPress')
    expect(emit).toHaveBeenCalledWith({ type: 'tabLongPress', target: 'index-k' })
  })
})
