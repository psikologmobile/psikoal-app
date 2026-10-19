import { Text } from 'react-native'

import { render } from '@testing-library/react-native'

import { resolveColumns, WebColumns } from './WebColumns'
import { chunkIntoRows, WebGrid } from './WebGrid'

const mockDims = { width: 1440 }
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockDims.width, height: 900, scale: 1, fontScale: 1 }),
}))

describe('resolveColumns', () => {
  it('varsayılan: 1100 ve altında alt alta', () => {
    expect(resolveColumns(1440, {})).toEqual({ stacked: false, asideWidth: 360 })
    expect(resolveColumns(1100, {})).toEqual({ stacked: true, asideWidth: 360 })
  })

  it('dar pencerede yan sütun daralır', () => {
    const opts = { asideWidth: 400, asideWidthNarrow: 340, stackAt: 860 }
    expect(resolveColumns(1440, opts)).toEqual({ stacked: false, asideWidth: 400 })
    expect(resolveColumns(1024, opts)).toEqual({ stacked: false, asideWidth: 340 })
    expect(resolveColumns(800, opts)).toEqual({ stacked: true, asideWidth: 340 })
  })
})

describe('WebColumns', () => {
  it('geniş pencerede yan yana; sol yan sütun önce', () => {
    mockDims.width = 1440
    const view = render(
      <WebColumns testID="cols" asidePosition="left" asideWidth={260} aside={<Text>süzgeç</Text>}>
        <Text>kartlar</Text>
      </WebColumns>
    )
    expect(view.getByTestId('cols-aside')).toHaveStyle({ width: 260 })
    expect(view.getByText('süzgeç')).toBeTruthy()
    expect(view.getByText('kartlar')).toBeTruthy()
  })

  it('alt alta düzende yan sütun gizlenebilir', () => {
    mockDims.width = 1024
    const view = render(
      <WebColumns testID="cols" hideAsideWhenStacked aside={<Text>süzgeç</Text>}>
        <Text>kartlar</Text>
      </WebColumns>
    )
    expect(view.queryByText('süzgeç')).toBeNull()
    expect(view.getByText('kartlar')).toBeTruthy()
  })

  it('alt alta düzende yan sütun tam genişlik', () => {
    mockDims.width = 900
    const view = render(
      <WebColumns testID="cols" aside={<Text>özet</Text>}>
        <Text>teklifler</Text>
      </WebColumns>
    )
    expect(view.getByTestId('cols-aside')).not.toHaveStyle({ width: 360 })
  })
})

describe('WebGrid', () => {
  it('chunkIntoRows', () => {
    expect(chunkIntoRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunkIntoRows([1, 2], 0)).toEqual([[1], [2]])
  })

  it('öğeleri satırlara dizer', () => {
    const view = render(
      <WebGrid columns={3} testID="grid">
        <Text>a</Text>
        <Text>b</Text>
        {null}
        <Text>c</Text>
        <Text>d</Text>
      </WebGrid>
    )
    expect(view.getByText('d')).toBeTruthy()
    expect(view.getByTestId('grid').children).toHaveLength(2)
  })
})
