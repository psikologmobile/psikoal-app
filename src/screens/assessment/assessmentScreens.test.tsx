import { act, fireEvent } from '@testing-library/react-native'

import { AssessmentListScreen } from './AssessmentListScreen'
import { AssessmentPlayScreen } from './AssessmentPlayScreen'
import { AssessmentResultScreen } from './AssessmentResultScreen'

import { errorQuery, mockRouter, queryResult, renderScreen } from '@/test-utils/screen'

jest.mock('expo-router', () => require('@/test-utils/screen').expoRouterMock)
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@/test-utils/screen').asyncStorageMock
)
jest.mock('expo-secure-store', () => require('@/test-utils/screen').secureStoreMock)
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
)

const mockActive = jest.fn()
const mockResults = jest.fn()
const mockResult = jest.fn()
const mockSubmit = jest.fn()

jest.mock('@/domains/assessment/api/useAssessmentQuery', () => ({
  useAssessmentQuery: () => mockActive(),
}))
jest.mock('@/domains/assessment/hooks/usePlayableAssessments', () => ({
  usePlayableAssessments: () => ({
    data: [
      { id: 'a1', title: 'Kaygı ölçeği', category: 'kaygi', estimatedMinutes: 3, questionCount: 2 },
    ],
    isLoading: false,
    refetch: jest.fn(),
  }),
}))
jest.mock('@/domains/assessment/api/useMyAssessmentResultsQuery', () => ({
  useMyAssessmentResultsQuery: () => mockResults(),
}))
jest.mock('@/domains/assessment/api/useAssessmentResultQuery', () => ({
  useAssessmentResultQuery: () => mockResult(),
}))
jest.mock('@/domains/assessment/api/useSubmitAssessmentMutation', () => ({
  useSubmitAssessmentMutation: () => ({ mutate: mockSubmit, isPending: false, error: null }),
}))

const opts = (...values: number[]) =>
  values.map((value) => ({
    id: `o${value}`,
    text: value === 0 ? 'Hiç' : `Seçenek ${value}`,
    value,
  }))

const ASSESSMENT = {
  id: 'a1',
  title: 'Kaygı ölçeği',
  description: 'Son iki haftayı düşünerek yanıtla.',
  estimatedMinutes: 3,
  questions: [
    { id: 'q1', text: 'Gergin hissettin mi?', type: 'single_choice', options: opts(0, 1, 2, 3) },
    { id: 'q2', text: 'Hangilerini yaşadın?', type: 'multiple_choice', options: opts(1, 2) },
  ],
}

const RESULT = {
  id: 'r1',
  score: 4,
  level: 'moderate',
  summary: 'Belirgin kaygı belirtileri',
  suggestions: ['Nefes egzersizi dene.'],
  createdAt: '2026-10-18T10:00:00Z',
}

beforeEach(() => {
  jest.clearAllMocks()
  mockActive.mockReturnValue(queryResult(ASSESSMENT))
  mockResult.mockReturnValue(queryResult(RESULT))
  mockResults.mockReturnValue(
    queryResult({
      data: [{ ...RESULT, assessmentId: 'a1', assessmentTitle: 'Kaygı ölçeği' }],
      meta: { page: 1, total: 1, perPage: 20 },
    })
  )
})

describe('AssessmentListScreen', () => {
  it('sonuçlarım ve tüm testler', () => {
    const { getByText, getAllByText, getByLabelText } = renderScreen(<AssessmentListScreen />)
    expect(getByText('Kendini tanımanın kısa yolu')).toBeTruthy()
    expect(getAllByText('Kaygı ölçeği').length).toBe(2)
    expect(getByText('Orta')).toBeTruthy()
    fireEvent.press(getByLabelText('Kaygı ölçeği, seviye Orta'))
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/assessment/result',
      params: { resultId: 'r1' },
    })
  })

  it('sonuç yok', () => {
    mockResults.mockReturnValue(queryResult({ data: [], meta: { page: 1, total: 0, perPage: 20 } }))
    expect(
      renderScreen(<AssessmentListScreen />).getByText(
        'Henüz bir test çözmedin. Aşağıdan biriyle başlayabilirsin.'
      )
    ).toBeTruthy()
  })
})

describe('AssessmentPlayScreen', () => {
  it('giriş → soru → gönder', () => {
    const { getByText, getByTestId } = renderScreen(<AssessmentPlayScreen />)
    expect(getByText('Ücretsiz test')).toBeTruthy()
    expect(getByText('2 soru')).toBeTruthy()
    fireEvent.press(getByTestId('assessment-start'))

    expect(getByText('Tek seçim')).toBeTruthy()
    expect(getByText('Devam etmek için bir seçenek seç')).toBeTruthy()
    fireEvent.press(getByText('Seçenek 2'))
    fireEvent.press(getByText('Sonraki soru'))

    expect(getByText('Çoklu seçim')).toBeTruthy()
    fireEvent.press(getByText('Seçenek 1'))
    fireEvent.press(getByText('Gönder ve sonucu gör'))
    expect(mockSubmit).toHaveBeenCalledWith(
      {
        assessmentId: 'a1',
        answers: [
          { questionId: 'q1', values: [2] },
          { questionId: 'q2', values: [1] },
        ],
      },
      expect.any(Object)
    )
    const { onSuccess } = mockSubmit.mock.calls[0]?.[1] as {
      onSuccess: (r: { id: string }) => void
    }
    act(() => onSuccess({ id: 'r9' }))
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/assessment/result',
      params: { resultId: 'r9' },
    })
  })

  it('yüklenemedi', () => {
    mockActive.mockReturnValue(errorQuery())
    expect(renderScreen(<AssessmentPlayScreen />).getByText('Test yüklenemedi')).toBeTruthy()
  })
})

describe('AssessmentResultScreen', () => {
  it('puan halkası, seviye, öneriler ve "Destek al"', () => {
    const { getByText, getByLabelText } = renderScreen(<AssessmentResultScreen resultId="r1" />)
    expect(getByLabelText('4 / 6 puan')).toBeTruthy()
    expect(getByText('Orta düzey')).toBeTruthy()
    expect(getByText('Belirgin kaygı belirtileri')).toBeTruthy()
    expect(getByText('Nefes egzersizi dene.')).toBeTruthy()
    fireEvent.press(getByText('Destek al'))
    expect(mockRouter.push).toHaveBeenCalledWith('/listing/new')
  })

  it('sonuç bulunamadı', () => {
    mockResult.mockReturnValue(errorQuery())
    expect(
      renderScreen(<AssessmentResultScreen resultId="x" />).getByText('Sonuç bulunamadı')
    ).toBeTruthy()
  })
})
