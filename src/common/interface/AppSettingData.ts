import { notImpl } from '../util/Nop'
import { Result } from '../util/Result'

export type AppSettingData = Readonly<{
  dbSettingId: string | null
  ucompanyId: string | null
  userId: string | null
}>

export const emptyAppSettingData: AppSettingData = {
  dbSettingId: null,
  ucompanyId: null,
  userId: null
} as const

export interface AppSettingService {
  set: (setting: AppSettingData) => Promise<Result<void>>
  get: () => Promise<Result<AppSettingData>>
}

export const fakeAppSettingService: AppSettingService = {
  set: notImpl,
  get: notImpl
}
