import { notImpl } from '../util/Nop'
import { Result } from '../util/Result'
import { OffsetLimit } from './OffsetLimit'
import { User } from './User'

export type BizCard = Readonly<{
  bizCardId: string
  ucompanyId: string
  userId: string
  registerChannel: string
  registerTimestamp: Date
  entryStatus: string | null
  identificationFlag: string | null
  stackId: string
  stackOrder: number
  updateTimestamp: Date | null
  sansanCompanyCode: string | null
  companyName: string | null
  lastName: string | null
  firstName: string | null
  email: string | null
  issueDate: Date | null
  publishDate: Date | null
  newsSourceType: number | null
  newsSourceId: string | null
}>

export type BizCardSearchQuery = Readonly<{
  query: string | null
}>

export type BizCardSearchQueryWithOffsetLimit = BizCardSearchQuery & OffsetLimit

export type BizCardUpdateInput = Omit<Partial<BizCard>, 'bizCardId' | 'ucompanyId' | 'userId'>

export const BizCardRegisterChannels = {
  UserProfile: '00010011',
  SelfBizCardSource: '00010010',
  Create: '00000010'
} as const

export type BizCardRegisterChannel =
  (typeof BizCardRegisterChannels)[keyof typeof BizCardRegisterChannels]

export interface BizCardService {
  getAll(
    dbSettingId: string,
    ucompanyId: string,
    userId: string,
    query: BizCardSearchQueryWithOffsetLimit
  ): Promise<Result<readonly BizCard[]>>
  count(
    dbSettingId: string,
    ucompanyId: string,
    userId: string,
    query: BizCardSearchQuery
  ): Promise<Result<number>>
  update(
    dbSettingId: string,
    ucompanyId: string,
    bizCardIds: readonly string[],
    input: BizCardUpdateInput,
    operatorUser: User
  ): Promise<Result<void>>
}

export const FakeBizCardService: BizCardService = {
  getAll: notImpl,
  count: notImpl,
  update: notImpl
} as const
