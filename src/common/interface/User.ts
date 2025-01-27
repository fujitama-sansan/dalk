import { notImpl } from '../util/Nop'
import { Result } from '../util/Result'

export type User = Readonly<{
  userId: string
  ucompanyId: string
  userName: string
  email: string
  effectiveDateFrom: Date
  effectiveDateTo: Date
  loginEmail: string | null
  uuid: string | null
  billingGroupIds: string[]
}>

export type UserSearchQuery = Readonly<{
  query: string | null
}>

export interface UserService {
  search: (
    dbSettingId: string,
    ucompanyId: string,
    searchQuery: UserSearchQuery
  ) => Promise<Result<readonly User[]>>
  get: (dbSettingId: string, ucompanyId: string, userId: string) => Promise<Result<User>>
}

export const fakeUserService: UserService = {
  search: notImpl,
  get: notImpl
} as const
