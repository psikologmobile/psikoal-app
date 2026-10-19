import { render } from '@testing-library/react-native'

import { BudgetCells } from './BudgetCells'

describe('BudgetCells', () => {
  it('renders 8 cells, selected range (order-independent) in primary', () => {
    const { toJSON } = render(<BudgetCells from={5} to={2} />)
    const json = JSON.stringify(toJSON())
    expect(json.match(/bg-primary/g)).toHaveLength(4)
    expect(json.match(/bg-border-strong/g)).toHaveLength(4)
  })

  it('supports a custom count', () => {
    const { toJSON } = render(<BudgetCells count={4} from={0} to={0} className="mt-2" />)
    expect(JSON.stringify(toJSON()).match(/bg-primary/g)).toHaveLength(1)
  })
})
