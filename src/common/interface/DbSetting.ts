import { notImpl } from '../util/Nop'
import { Result } from '../util/Result'
import { Entity, EntityInput } from './Entity'

type DbSettingBase = Entity &
  Readonly<{
    name: string
    user: string
    password: string
  }>

export type DevDbSetting = DbSettingBase &
  Readonly<{
    host: string
    port: number
    staging: false
  }>

export type StagingDbSetting = DbSettingBase &
  Readonly<{
    staging: true
  }>

export type DbSetting = DevDbSetting | StagingDbSetting

export type DbSettingUpdateInput = EntityInput<DevDbSetting> | EntityInput<StagingDbSetting>

export const emptyDbSetting: DbSetting = {
  id: '',
  name: '',
  host: '',
  port: 0,
  user: '',
  password: '',
  staging: false
} as const

export const dbSettingIsFilled = (setting: DbSetting): boolean =>
  !!(setting.name && setting.user && setting.password) &&
  (setting.staging || !!(setting.host && setting.port))

export interface DbSettingService {
  getAll: () => Promise<Result<readonly DbSetting[]>>
  create: () => Promise<Result<DbSetting>>
  update: (id: string, setting: DbSettingUpdateInput) => Promise<Result<void>>
  remove: (id: string) => Promise<Result<void>>
}

export const fakeDbSettingService: DbSettingService = {
  getAll: notImpl,
  create: notImpl,
  update: notImpl,
  remove: notImpl
} as const
