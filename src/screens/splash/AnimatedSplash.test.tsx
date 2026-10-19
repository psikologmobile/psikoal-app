import { act, fireEvent, screen } from '@testing-library/react-native'

import { AnimatedSplash, SPLASH_MIN_MS } from './AnimatedSplash'

import { renderScreen } from '@/test-utils/screen'

describe('AnimatedSplash', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('marka ve yükleyiciyi çizer; hazır + en kısa süre dolunca biter', () => {
    const onDone = jest.fn()
    renderScreen(<AnimatedSplash ready onDone={onDone} />)
    expect(screen.getByText('PsikoAl')).toBeTruthy()
    expect(screen.getByText('Doğru uzmanla buluş.')).toBeTruthy()
    expect(onDone).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(SPLASH_MIN_MS))
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('oturum hazır değilse bekler; "Dokun, devam et" hazır olunca hemen kapatır', () => {
    const onDone = jest.fn()
    const view = renderScreen(<AnimatedSplash ready={false} onDone={onDone} />)
    act(() => jest.advanceTimersByTime(SPLASH_MIN_MS * 3))
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.press(screen.getByLabelText('Dokun, devam et'))
    view.rerender(<AnimatedSplash ready onDone={onDone} />)
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
