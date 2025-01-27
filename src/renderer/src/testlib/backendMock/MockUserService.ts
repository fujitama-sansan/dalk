import { User, UserService } from '../../../../common/interface'
import { Result } from '../../../../common/util/Result'
import { MockUtil } from './MockUtil'

export class MockUserService implements UserService {
  private readonly util: MockUtil
  constructor(waitMs: number) {
    this.util = new MockUtil('User', waitMs)
  }

  get(_dbSettingId: string, ucompanyId: string, userId: string): Promise<Result<User>> {
    return this.util.wrap('get', () => mockUser(ucompanyId, userId))
  }

  search(
    _dbSettingId: string,
    ucompanyId: string,
    query: { query: string | null }
  ): Promise<Result<ReadonlyArray<User>>> {
    return this.util.wrap('search', async () => {
      if (query.query) {
        return filterUsers(ucompanyId, query.query)
      } else {
        return ucompanyUsers(ucompanyId)
      }
    })
  }
}

const mockUser = (ucompanyId: string, userId: string): User => ({
  userId,
  userName: `ユーザー ${userId}太郎`,
  email: `mock-${userId}@example.com`,
  billingGroupIds: ['1'],
  effectiveDateFrom: new Date('2021-01-01'),
  effectiveDateTo: new Date('2021-12-31'),
  loginEmail: `mock-${userId}@example.com`,
  ucompanyId,
  uuid: `mock-uuid-${userId}`
})

const ucompanyUsers = (ucompanyId: string): readonly User[] =>
  new Array(152).fill('').map((_, i) => ({
    userId: `u-${i}`,
    ucompanyId,
    userName: `ユーザー ${i}太郎`,
    email: `test${i}@example.com`,
    effectiveDateFrom: new Date('2021-01-01T00:00:00Z'),
    effectiveDateTo: new Date('2099-12-31T23:59:59Z'),
    loginEmail: `test${i}@example.com`,
    uuid: 'xxxx-xxxx-xxxx-xxxx',
    billingGroupIds: ['00000000001']
  }))

const filterUsers = (ucompanyId: string, query: string): readonly User[] =>
  ucompanyUsers(ucompanyId).filter(
    (user) =>
      user.userName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.loginEmail?.toLowerCase().includes(query)
  )
