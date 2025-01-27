import { QuerySetDefinition, QuerySetDefinitionService } from '../../../../common/interface'
import { Result } from '../../../../common/util/Result'
import { MockIdGenerator } from './MockIdGenerator'
import { MockRepository } from './MockRepository'
import { MockUtil } from './MockUtil'

export class MockQuerySetDefinitionService implements QuerySetDefinitionService {
  private readonly util: MockUtil
  private readonly repository: MockRepository<QuerySetDefinition> = new MockRepository(
    'sql',
    new (class {
      create(id: string): QuerySetDefinition {
        return {
          id,
          name: id.replace('sql-', 'SQL '),
          description: `This is a sample SQL ${id}`,
          threshold: 0,
          maxCount: 100,
          queries: [],
          ucompanyIds: ''
        }
      }
      initialize(idGenerator: MockIdGenerator): ReadonlyArray<QuerySetDefinition> {
        return [
          {
            ...this.create(idGenerator.generate()),
            ucompanyIds: '33i 55i',
            threshold: 500,
            maxCount: 10,
            queries: [
              {
                id: idGenerator.generate(),
                query: 'SELECT * FROM test_table',
                targetParameter: ''
              }
            ]
          },
          {
            ...this.create(idGenerator.generate()),
            queries: [
              {
                id: idGenerator.generate(),
                query: 'SELECT * FROM trn_nc WHERE id = @Id',
                targetParameter: ''
              },
              {
                id: idGenerator.generate(),
                query: 'SELECT id FROM trn_nc WHERE ucompany_id = @UcompanyId LIMIT @Limit',
                targetParameter: 'Id'
              },
              {
                id: idGenerator.generate(),
                query: '10',
                targetParameter: 'Limit'
              }
            ]
          }
        ]
      }
    })()
  )

  constructor(waitMs: number) {
    this.util = new MockUtil('QuerySetDefinition', waitMs)
  }

  getAll(): Promise<Result<ReadonlyArray<QuerySetDefinition>>> {
    return this.util.wrap('getAll', () => this.repository.getAll())
  }

  create(): Promise<Result<QuerySetDefinition>> {
    return this.util.wrap('create', () => this.repository.create())
  }

  update(id: string, def: Partial<QuerySetDefinition>): Promise<Result<void>> {
    return this.util.wrap('update', () => {
      this.repository.update(id, def)
    })
  }

  remove(id: string): Promise<Result<void>> {
    return this.util.wrap('remove', () => {
      this.repository.remove(id)
    })
  }

  duplicate(id: string): Promise<Result<QuerySetDefinition>> {
    return this.util.wrap('duplicate', () => {
      const existing = this.repository.get(id)
      const newRecord = this.repository.create()
      const updated: QuerySetDefinition = {
        ...newRecord,
        ...existing,
        id: newRecord.id
      }
      this.repository.update(newRecord.id, updated)
      return updated
    })
  }
}
