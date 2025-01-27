import {
  MsExchangeIntegrationInfo,
  MsExchangeIntegrationService,
  User
} from '../../../../common/interface'
import { Result } from '../../../../common/util/Result'
import { MockUtil } from './MockUtil'

export class MockMSExchangeIntegrationService implements MsExchangeIntegrationService {
  private readonly util: MockUtil

  constructor(waitMs: number) {
    this.util = new MockUtil('MockMSExchangeIntegration', waitMs)
  }

  get(
    _dbSettingId: string,
    ucompanyId: string,
    billingGroupId: string,
    userUuid: string
  ): Promise<Result<MsExchangeIntegrationInfo | null>> {
    return this.util.wrap('get', async () => {
      return {
        credential: {
          credentialId: 'cred-1',
          ucompanyId,
          billingGroupId,
          tenantId: 'msexchange'
        },
        fetchSchedule: {
          credentialId: 'cred-1',
          ucompanyId,
          userUuid,
          lastFetchTimestamp: new Date('2021-01-01T00:00:00Z'),
          fetchInterval: '60',
          fetchStatus: 1
        }
      }
    })
  }

  changeLastFetchTimestamp(
    _dbSettingId: string,
    _ucompanyId: string,
    _credentialId: string,
    _userUuid: string,
    _operatorUser: User,
    lastFetchTimestamp: Date | null
  ): Promise<Result<void>> {
    return this.util.wrap(
      'changeLastFetchTimestamp',
      async () => {
        return
      },
      { lastFetchTimestamp }
    )
  }
}
