import { UserSettingAccessor, UserSettingKeys } from './UserSettingAccessor'

type WindowState = Readonly<{
  width: number
  height: number
}>

const defaultWindowState: WindowState = {
  width: 1200,
  height: 800
} as const

const userSettingKeys: UserSettingKeys<WindowState> = {
  width: 'WindowState.width',
  height: 'WindowState.height'
} as const

const get = (): Promise<WindowState> =>
  UserSettingAccessor.getValues(userSettingKeys, defaultWindowState)

const set = (setting: WindowState): Promise<void> =>
  UserSettingAccessor.setValues(userSettingKeys, setting)

export const WindowStateStore = {
  get,
  set
} as const
