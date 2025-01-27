import { AppSettingData, AppSettingService } from '../../../../common/interface'
import { Result } from '../../../../common/util/Result'
import { MockDbSettingService } from './MockDbSettingService'
import { MockUtil } from './MockUtil'

export class MockAppSettingService implements AppSettingService {
  private readonly util: MockUtil
  private data: AppSettingData

  constructor(waitMs: number, mockDbSettingService: MockDbSettingService) {
    this.util = new MockUtil('AppSetting', waitMs)
    this.data = {
      dbSettingId: mockDbSettingService.mockDbSettingRepository.getAll()[0].id,
      ucompanyId: '1',
      userId: '3'
    }
  }

  set(setting: AppSettingData): Promise<Result<void>> {
    return this.util.wrap('set', () => {
      this.data = setting
    })
  }

  get(): Promise<Result<AppSettingData>> {
    return this.util.wrap('get', () => this.data)
  }
}
