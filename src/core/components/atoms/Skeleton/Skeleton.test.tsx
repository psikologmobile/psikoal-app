import { render } from '@testing-library/react-native'

import { Skeleton, SkeletonGroup } from './Skeleton'

describe('Skeleton', () => {
  it('renders an accessible placeholder', () => {
    const { getByLabelText } = render(<Skeleton />)
    expect(getByLabelText('Yükleniyor')).toBeTruthy()
  })

  it('applies given dimensions via style', () => {
    const { getByLabelText } = render(<Skeleton width={120} height={40} />)
    const style = getByLabelText('Yükleniyor').props.style
    expect(JSON.stringify(style)).toContain('"width":120')
    expect(JSON.stringify(style)).toContain('"height":40')
  })

  it('makes circle variant square', () => {
    const { getByLabelText } = render(<Skeleton variant="circle" height={48} />)
    expect(JSON.stringify(getByLabelText('Yükleniyor').props.style)).toContain('"width":48')
  })

  it('uses variant defaults for line and rect', () => {
    const line = render(<Skeleton variant="line" />)
    expect(JSON.stringify(line.getByLabelText('Yükleniyor').props.style)).toContain('"height":18')
    const rect = render(<Skeleton variant="rect" delay={150} />)
    expect(JSON.stringify(rect.getByLabelText('Yükleniyor').props.style)).toContain('"height":120')
  })

  it('applies border color block with radius and custom className', () => {
    const { toJSON } = render(<Skeleton borderRadius="full" className="opacity-80" />)
    const json = JSON.stringify(toJSON())
    expect(json).toContain('bg-border')
    expect(json).toContain('rounded-full')
    expect(json).toContain('opacity-80')
  })
})

describe('SkeletonGroup', () => {
  it('renders children with gap', () => {
    const { getAllByLabelText, toJSON } = render(
      <SkeletonGroup gap="lg">
        <Skeleton />
        <Skeleton />
      </SkeletonGroup>
    )
    expect(getAllByLabelText('Yükleniyor').length).toBe(3)
    expect(JSON.stringify(toJSON())).toContain('gap-3.5')
  })
})
