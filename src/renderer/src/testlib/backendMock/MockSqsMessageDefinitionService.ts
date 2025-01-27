import { SqsMessageDefinition, SqsMessageDefinitionService } from '../../../../common/interface'
import { Result } from '../../../../common/util/Result'
import { MockIdGenerator } from './MockIdGenerator'
import { MockRepository } from './MockRepository'
import { MockSqsQueues } from './MockSqsQueueService'
import { MockUtil } from './MockUtil'

export class MockSqsMessageDefinitionService implements SqsMessageDefinitionService {
  private readonly util: MockUtil
  private readonly repository: MockRepository<SqsMessageDefinition> = new MockRepository(
    'SqsMessageDefinition',
    new (class {
      create(id: string): SqsMessageDefinition {
        return {
          id,
          name: '',
          queue: MockSqsQueues[0],
          messageClass: '',
          correlationId: '',
          graph: ''
        }
      }

      initialize(idGenerator: MockIdGenerator): ReadonlyArray<SqsMessageDefinition> {
        return [
          {
            id: idGenerator.generate(),
            name: 'ひとつめ',
            queue: MockSqsQueues[0],
            messageClass: 'com.example.Message1',
            correlationId: '',
            graph: '{"UcompanyId": "55i"}'
          },
          {
            id: idGenerator.generate(),
            name: 'ふたつめ',
            queue: MockSqsQueues[1],
            messageClass: 'com.example.Message2',
            correlationId: '',
            graph: '{"UcompanyId": "55i"}'
          },
          {
            id: idGenerator.generate(),
            name: 'みっつめ',
            queue: MockSqsQueues[0],
            messageClass: 'com.example.Message3',
            correlationId: '',
            graph: '{"UcompanyId": "55i", "UserId": "u-1"}'
          },
          {
            id: idGenerator.generate(),
            name: 'よっつめ',
            queue: MockSqsQueues[2],
            messageClass: 'com.example.Message4',
            correlationId: '',
            graph: '{"UcompanyId": "55i", "UserId": "u-2"}'
          },
          {
            id: idGenerator.generate(),
            name: 'いつつめ',
            queue: MockSqsQueues[2],
            messageClass: 'com.example.Message5',
            correlationId: '',
            graph: '{"UcompanyId": "55i", "UserId": "u-1"}'
          }
        ]
      }
    })()
  )

  constructor(waitMs: number) {
    this.util = new MockUtil('SQSMessageDefinition', waitMs)
  }

  getAll(): Promise<Result<ReadonlyArray<SqsMessageDefinition>>> {
    return this.util.wrap('getAll', () => this.repository.getAll())
  }

  create(): Promise<Result<SqsMessageDefinition>> {
    return this.util.wrap('create', () => this.repository.create())
  }

  update(id: string, input: Partial<SqsMessageDefinition>): Promise<Result<void>> {
    return this.util.wrap('update', () => {
      this.repository.update(id, input)
    })
  }

  remove(id: string): Promise<Result<void>> {
    return this.util.wrap('remove', () => {
      this.repository.remove(id)
    })
  }
}
