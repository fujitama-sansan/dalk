import { MsExchangeIntegrationInfo } from '../../../common/interface'
import { AppSettingAtom } from '../app/AppSettingAtom'
import { BackendAtom } from '../ipc/BackendAtom'
import { AsyncHandler, AsyncRead, JotaiUtil } from '../util/JotaiUtil'

export type MSExchangeIntegrationAction = {
  type: 'changeLastFetchTimestamp'
  schedule: Date | null
}

const read: AsyncRead<MsExchangeIntegrationInfo | null> = async (get) => {
  const appSetting = await get(AppSettingAtom.atom)
  const backend = get(BackendAtom.atom).MsExchangeIntegration
  if (appSetting.state === 'Complete') {
    const { data, operatorUser } = appSetting
    const infoR = await backend.get(
      data.dbSettingId,
      data.ucompanyId,
      operatorUser.billingGroupIds[0],
      operatorUser.uuid || ''
    )
    if (infoR.success) {
      return infoR.value
    }
  }
  return null
}

const changeLastFetchTimestamp: AsyncHandler<
  MsExchangeIntegrationInfo | null,
  MSExchangeIntegrationAction
> = async (curr, get, _set, action) => {
  if (action.type === 'changeLastFetchTimestamp' && curr) {
    const appSetting = await get(AppSettingAtom.atom)
    const backend = get(BackendAtom.atom).MsExchangeIntegration
    if (appSetting.state === 'Complete') {
      const { data, operatorUser } = appSetting
      const r = await backend.changeLastFetchTimestamp(
        data.dbSettingId,
        data.ucompanyId,
        curr.credential.credentialId,
        operatorUser.uuid || '',
        operatorUser,
        action.schedule
      )
      if (r.success) {
        return {
          ...curr,
          fetchSchedule: { ...curr.fetchSchedule, lastFetchTimestamp: action.schedule }
        }
      }
    }
  }
  return curr
}

const mainAtom = JotaiUtil.asyncAtomWithAction(
  read,
  JotaiUtil.composeAsyncHandlers({ changeLastFetchTimestamp })
)

export const MSExchangeIntegrationAtom = {
  atom: mainAtom,
  ChangeLastFetchTimestamp: (schedule: Date | null): MSExchangeIntegrationAction => ({
    type: 'changeLastFetchTimestamp',
    schedule
  })
} as const
