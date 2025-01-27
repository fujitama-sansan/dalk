import {
  BizCard,
  BizCardSearchQuery,
  BizCardSearchQueryWithOffsetLimit,
  BizCardService,
  BizCardUpdateInput,
  User
} from '../../../../common/interface'
import { Result } from '../../../../common/util/Result'
import { MockUtil } from './MockUtil'

const ucompanyBizCards = (ucompanyId: string, userId: string): readonly BizCard[] =>
  new Array(152).fill('').map((_, i) => ({
    bizCardId: `bc-${i}`,
    ucompanyId,
    userId,
    registerChannel: 'channel-1',
    registerTimestamp: new Date('2021-01-01T00:00:00Z'),
    entryStatus: '00110100',
    identificationFlag: '00000000',
    stackId: 'stack-1',
    stackOrder: 1,
    updateTimestamp: new Date('2021-01-01T00:00:00Z'),
    sansanCompanyCode: `0000000000${ucompanyId}`,
    companyName: `Test Company ${ucompanyId}`,
    lastName: `Test ${i}`,
    firstName: `Taro ${i * 7}`,
    email: `ttr${i * 13}@example.com`,
    issueDate: new Date('2021-01-01T00:00:00Z'),
    publishDate: new Date('2021-01-01T00:00:00Z'),
    newsSourceType: 1,
    newsSourceId: 'news-1'
  }))

const filteredBizCards = (ucompanyId: string, userId: string, query: string): readonly BizCard[] =>
  ucompanyBizCards(ucompanyId, userId).filter(
    (bc) =>
      (bc.lastName && bc.lastName.toLowerCase().includes(query)) ||
      (bc.firstName && bc.firstName.toLowerCase().includes(query)) ||
      (bc.email && bc.email.toLowerCase().includes(query)) ||
      (bc.bizCardId && bc.bizCardId.toLowerCase().includes(query))
  )

const offsetLimit = <T>(arr: readonly T[], ol: { offset: number; limit: number }): readonly T[] =>
  arr.slice(ol.offset, ol.offset + ol.limit)

export class MockBizCardService implements BizCardService {
  private readonly util: MockUtil
  constructor(waitMs: number) {
    this.util = new MockUtil('BizCard', waitMs)
  }

  getAll(
    _dbSettingId: string,
    ucompanyId: string,
    userId: string,
    query: BizCardSearchQueryWithOffsetLimit
  ): Promise<Result<readonly BizCard[]>> {
    return this.util.wrap('getAll', async () => {
      if (query.query) {
        return offsetLimit(filteredBizCards(ucompanyId, userId, query.query), query)
      } else {
        return offsetLimit(ucompanyBizCards(ucompanyId, userId), query)
      }
    })
  }

  count(
    _dbSettingId: string,
    ucompanyId: string,
    userId: string,
    query: BizCardSearchQuery
  ): Promise<Result<number>> {
    return this.util.wrap('count', async () => {
      if (query.query) {
        return filteredBizCards(ucompanyId, userId, query.query).length
      } else {
        return ucompanyBizCards(ucompanyId, userId).length
      }
    })
  }

  update(
    _dbSettingId: string,
    _ucompanyId: string,
    _bizCardIds: readonly string[],
    _input: BizCardUpdateInput,
    operatorUser: User
  ): Promise<Result<void>> {
    return this.util.wrap('update', () => {}, { operatorUser })
  }
}
