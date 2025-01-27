import { DbSetting, DbSettingService, EntityInput } from '../../../../common/interface'
import { Result } from '../../../../common/util/Result'
import { MockIdGenerator } from './MockIdGenerator'
import { MockRepository } from './MockRepository'
import { MockUtil } from './MockUtil'

export class MockDbSettingService implements DbSettingService {
  private readonly util: MockUtil

  readonly mockDbSettingRepository: MockRepository<DbSetting> = new MockRepository('dbSetting', {
    create: (id: string): DbSetting => ({
      id,
      name: '',
      host: '',
      port: 0,
      user: '',
      password: '',
      staging: false
    }),
    initialize: (idGenerator: MockIdGenerator): ReadonlyArray<DbSetting> =>
      new Array(2).fill('').map((_, i) => ({
        id: idGenerator.generate(),
        name: `test-setting-${i}`,
        host: 'localhost',
        port: 5432,
        user: `testuser-${i}`,
        password: `pq2sw0rb-${i}`,
        staging: i === 1
      }))
  })

  constructor(waitMs: number) {
    this.util = new MockUtil('DbSetting', waitMs)
  }

  create(): Promise<Result<DbSetting>> {
    return this.util.wrap('create', () => this.mockDbSettingRepository.create())
  }

  getAll(): Promise<Result<ReadonlyArray<DbSetting>>> {
    return this.util.wrap('getAll', () => this.mockDbSettingRepository.getAll())
  }

  remove(id: string): Promise<Result<void>> {
    return this.util.wrap('remove', () => {
      this.mockDbSettingRepository.remove(id)
    })
  }

  update(id: string, input: EntityInput<DbSetting>): Promise<Result<void>> {
    return this.util.wrap('update', () => {
      this.mockDbSettingRepository.update(id, input)
    })
  }
}
