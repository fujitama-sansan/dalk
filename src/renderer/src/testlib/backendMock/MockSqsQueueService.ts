import { SqsQueue, SqsQueueService } from '../../../../common/interface'
import { Result } from '../../../../common/util/Result'
import { MockUtil } from './MockUtil'

export class MockSQSQueueService implements SqsQueueService {
  private readonly util: MockUtil

  constructor(waitMs: number) {
    this.util = new MockUtil('SqsQueue', waitMs)
  }

  listQueues(prefix: string): Promise<Result<ReadonlyArray<SqsQueue>>> {
    return this.util.wrap('listQueues', () =>
      prefix ? queues.filter((q) => q.name.startsWith(prefix)) : []
    )
  }

  send(_queue: SqsQueue, message: string): Promise<Result<void>> {
    return this.util.wrap('send', () => undefined, { message })
  }
}

const queues: ReadonlyArray<SqsQueue> = [
  'yamada',
  'fujitama',
  'tanaka',
  'suzuki',
  'takahashi'
].flatMap((name) =>
  new Array(5).fill('').map(
    (_, i) =>
      ({
        name: `dev-${name}-${i}`,
        url: `https://sqs.ap-northeast-1.amazonaws.com/123456789012/dev-${name}-${i}`
      }) satisfies SqsQueue
  )
)

export const MockSqsQueues = queues
