import { Ucompany, UcompanyService } from '../../../../common/interface'
import { Result } from '../../../../common/util/Result'
import { MockUtil } from './MockUtil'

export class MockUcompanyService implements UcompanyService {
  private readonly util: MockUtil
  constructor(waitMs: number) {
    this.util = new MockUtil('Ucompany', waitMs)
  }

  get(_dbSettingId: string, companyId: string): Promise<Result<Ucompany>> {
    return this.util.wrap('get', () => ({
      ucompanyId: companyId,
      ucompanyName: `Test Company-${companyId}`
    }))
  }
}
