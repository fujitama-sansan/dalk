import { Story, StoryDefault } from '@ladle/react'
import { InProgressView, SuccessView } from './QueryExecutionResultView'

export const InProgress: Story = () => {
  return (
    <InProgressView
      state={{
        state: 'InProgress',
        totalCompanyCount: 10,
        successCount: 5,
        recentUcompanyId: '66i',
        allData: []
      }}
    />
  )
}

export const Success: Story = () => {
  return (
    <SuccessView
      state={{
        state: 'Success',
        chartData: [
          {
            ucompanyId: '66i',
            time: 100
          },
          {
            ucompanyId: '33i',
            time: 200
          },
          {
            ucompanyId: 'test1',
            time: 150
          },
          {
            ucompanyId: 'test2',
            time: 200
          }
        ],
        statistics: {
          average: 150,
          maximum: 200,
          totalCount: 2,
          successCount: 2,
          errorCount: 0,
          percentile99: 200,
          percentile95: 200
        }
      }}
    />
  )
}

export default {
  title: '_7 sql/2 Query result view'
} satisfies StoryDefault
