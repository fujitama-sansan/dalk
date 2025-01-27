import { AppSettingData, Ucompany, User, emptyAppSettingData } from '../../../common/interface'
import { BackendAtom } from '../ipc/BackendAtom'
import { AsyncHandler, AsyncRead, JotaiUtil } from '../util/JotaiUtil'

type Init = Readonly<{
  state: 'Init'
  data: AppSettingData
  ucompany: null
  operatorUser: null
  error: null
}>
type UcompanySet = Readonly<{
  state: 'UcompanySet'
  data: AppSettingData & { dbSettingId: string; ucompanyId: string }
  ucompany: Ucompany
  operatorUser: null
  error: null
}>
type Complete = Readonly<{
  state: 'Complete'
  data: AppSettingData & { dbSettingId: string; ucompanyId: string; userId: string }
  ucompany: Ucompany
  operatorUser: User
  error: null
}>
type Failed = Readonly<{
  state: 'Failed'
  data: AppSettingData
  ucompany: Ucompany | null
  operatorUser: null
  error: string
}>
export type AppSetting = Init | UcompanySet | Complete | Failed
export type CompleteAppSetting = Complete
export type UcompanySetSetting = Complete | UcompanySet

const isUcompanySet = (data: AppSettingData): data is UcompanySet['data'] =>
  !!(data.dbSettingId && data.ucompanyId)

const isComplete = (data: AppSettingData): data is Complete['data'] =>
  isUcompanySet(data) && !!data.userId

const init = (data: AppSettingData): Init => ({
  state: 'Init',
  data,
  ucompany: null,
  operatorUser: null,
  error: null
})
const ucompanySet = (data: UcompanySet['data'], ucompany: Ucompany): UcompanySet => ({
  state: 'UcompanySet',
  data,
  ucompany,
  operatorUser: null,
  error: null
})
const complete = (data: Complete['data'], ucompany: Ucompany, selectedUser: User): Complete => ({
  state: 'Complete',
  data,
  ucompany,
  operatorUser: selectedUser,
  error: null
})
const failed = (data: AppSettingData, ucompany: Ucompany | null, error: string): Failed => ({
  state: 'Failed',
  data,
  ucompany,
  operatorUser: null,
  error
})

export type AppSettingAction =
  | {
      type: 'selectDbSettingId'
      dbSettingId: string | null
    }
  | {
      type: 'setUcompanyId'
      ucompanyId: string | null
    }
  | {
      type: 'selectUser'
      user: User | null
    }
  | {
      type: 'reset'
    }

type AppSettingRead = AsyncRead<AppSetting>
type AppSettingHandler = AsyncHandler<AppSetting, AppSettingAction>

const readInit: AppSettingRead = async (get) => {
  const backend2 = get(BackendAtom.atom)
  const appSettingService = backend2.AppSetting
  const userService = backend2.User
  const ucompanyService = backend2.Ucompany

  const settingR = await appSettingService.get()
  if (settingR.success) {
    const setting = settingR.value
    if (isUcompanySet(setting)) {
      const companyR = await ucompanyService.get(setting.dbSettingId, setting.ucompanyId)
      if (companyR.success) {
        if (isComplete(setting)) {
          const userR = await userService.get(
            setting.dbSettingId,
            setting.ucompanyId,
            setting.userId
          )
          if (userR.success) {
            return complete(setting, companyR.value, userR.value)
          } else {
            return failed(setting, companyR.value, userR.error)
          }
        } else {
          return ucompanySet(setting, companyR.value)
        }
      } else {
        return failed(setting, null, companyR.error)
      }
    }
    return init(setting)
  } else {
    throw new Error(settingR.error)
  }
}

const selectDbSettingId: AppSettingHandler = async (curr, get, _set, action) => {
  if (action.type === 'selectDbSettingId') {
    const { dbSettingId } = action
    const newSetting: AppSettingData = { dbSettingId, ucompanyId: null, userId: null }
    const appSettingService = get(BackendAtom.atom).AppSetting
    await appSettingService.set(newSetting)
    return init(newSetting)
  }
  return curr
}

const setUcompanyId: AppSettingHandler = async (curr, get, _set, action) => {
  if (action.type === 'setUcompanyId') {
    const { ucompanyId } = action
    const newSetting: AppSettingData = { ...curr.data, ucompanyId, userId: null }
    if (!isUcompanySet(newSetting)) {
      return init(newSetting)
    }
    const ucompanyService = get(BackendAtom.atom).Ucompany
    const ucompanyR = await ucompanyService.get(newSetting.dbSettingId, newSetting.ucompanyId)
    if (ucompanyR.success) {
      return ucompanySet(newSetting, ucompanyR.value)
    } else {
      return failed(newSetting, null, ucompanyR.error)
    }
  }
  return curr
}

const selectUser: AppSettingHandler = async (curr, get, _set, action) => {
  if (action.type === 'selectUser') {
    const data = curr.data
    if (isUcompanySet(data) && curr.ucompany) {
      const { user } = action
      if (user) {
        const newSetting: Complete['data'] = { ...data, userId: user.userId }
        const appSettingService = get(BackendAtom.atom).AppSetting
        await appSettingService.set(newSetting)
        return complete(newSetting, curr.ucompany, user)
      }
      return ucompanySet(data, curr.ucompany)
    }
  }
  return curr
}

const reset: AppSettingHandler = async (curr, get, _set, action) => {
  if (action.type === 'reset') {
    const appSettingService = get(BackendAtom.atom).AppSetting
    await appSettingService.set(emptyAppSettingData)
    return init(emptyAppSettingData)
  }
  return curr
}

export const AppSettingAtom = {
  atom: JotaiUtil.asyncAtomWithAction(
    readInit,
    JotaiUtil.composeAsyncHandlers({
      selectDbSettingId,
      setUcompanyId,
      selectUser,
      reset
    })
  ),
  SelectDbSetting: (dbSettingId: string | null): AppSettingAction => ({
    type: 'selectDbSettingId',
    dbSettingId
  }),
  SetUcompanyId: (ucompanyId: string | null): AppSettingAction => ({
    type: 'setUcompanyId',
    ucompanyId
  }),
  SelectUser: (user: User | null): AppSettingAction => ({
    type: 'selectUser',
    user
  }),
  Reset: (): AppSettingAction => ({
    type: 'reset'
  })
} as const
