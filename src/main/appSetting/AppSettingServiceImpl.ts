import { AppSettingData, AppSettingService } from '../../common/interface'
import { Result, resultify } from '../../common/util/Result'
import { UserSettingAccessor, UserSettingKeys } from './UserSettingAccessor'

export class AppSettingServiceImpl implements AppSettingService {
  async get(): Promise<Result<AppSettingData>> {
    return resultify(() => UserSettingAccessor.getValues(userSettingKeys, emptySetting))
  }

  async set(setting: AppSettingData): Promise<Result<void>> {
    return resultify(() => UserSettingAccessor.setValues(userSettingKeys, setting))
  }
}

const emptySetting: AppSettingData = {
  dbSettingId: null,
  ucompanyId: null,
  userId: null
} as const

const userSettingKeys: UserSettingKeys<AppSettingData> = {
  dbSettingId: 'AppSetting.dbSettingId',
  ucompanyId: 'AppSetting.ucompanyId',
  userId: 'AppSetting.userId'
}
