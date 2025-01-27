import {
  AllFeatures,
  FeatureDef,
  FeatureEntry,
  FeatureName,
  FeatureService
} from '../../../common/interface'
import { AppSettingAtom, CompleteAppSetting } from '../app/AppSettingAtom'
import { BackendAtom } from '../ipc/BackendAtom'
import { AsyncHandler, AsyncRead, JotaiUtil } from '../util/JotaiUtil'

export type FeatureState = FeatureDef & FeatureEntry

export type FeatureStateList = ReadonlyArray<FeatureState>

export type FeatureStateAction =
  | {
      type: 'changeActivation'
      featureName: FeatureName
      activation: boolean
    }
  | {
      type: 'changeAvailability'
      featureName: FeatureName
      availability: boolean
    }

const reload = async (
  backend: FeatureService,
  appSetting: CompleteAppSetting
): Promise<FeatureStateList> => {
  const { data, operatorUser } = appSetting
  const billingGroupId = operatorUser.billingGroupIds[0]
  const featuresR = await backend.getAll(data.dbSettingId, data.ucompanyId, billingGroupId)
  if (featuresR.success) {
    return featuresR.value.map((entry) => ({
      ...entry,
      label: AllFeatures[entry.name].label
    }))
  } else {
    return []
  }
}

const init: AsyncRead<FeatureStateList> = async (get) => {
  const appSetting = await get(AppSettingAtom.atom)
  if (appSetting.state !== 'Complete') {
    throw new Error('selectedUser is not set')
  }

  const backend = get(BackendAtom.atom).Feature
  return reload(backend, appSetting)
}

const changeActivation: AsyncHandler<FeatureStateList, FeatureStateAction> = async (
  curr,
  get,
  _set,
  action
) => {
  if (action.type === 'changeActivation') {
    const appSetting = await get(AppSettingAtom.atom)
    if (appSetting.state !== 'Complete') {
      throw new Error('selectedUser is not set')
    }

    const backend = get(BackendAtom.atom).Feature
    const { data, operatorUser } = appSetting
    const billingGroupId = operatorUser.billingGroupIds[0]
    const result = await (action.activation
      ? backend.activate(
          data.dbSettingId,
          data.ucompanyId,
          operatorUser,
          billingGroupId,
          action.featureName
        )
      : backend.deactivate(
          data.dbSettingId,
          data.ucompanyId,
          operatorUser,
          billingGroupId,
          action.featureName
        ))
    if (result.success) {
      return reload(backend, appSetting)
    }
  }
  return curr
}

const changeAvailability: AsyncHandler<FeatureStateList, FeatureStateAction> = async (
  curr,
  get,
  _set,
  action
) => {
  if (action.type === 'changeAvailability') {
    const appSetting = await get(AppSettingAtom.atom)
    if (appSetting.state !== 'Complete') {
      throw new Error('selectedUser is not set')
    }

    const backend = get(BackendAtom.atom).Feature
    const { data, operatorUser } = appSetting
    const billingGroupId = operatorUser.billingGroupIds[0]
    const result = await (action.availability
      ? backend.makeAvailable(
          data.dbSettingId,
          data.ucompanyId,
          operatorUser,
          billingGroupId,
          action.featureName
        )
      : backend.makeUnavailable(
          data.dbSettingId,
          data.ucompanyId,
          operatorUser,
          billingGroupId,
          action.featureName
        ))
    if (result.success) {
      return reload(backend, appSetting)
    }
  }
  return curr
}

const mainAtom = JotaiUtil.asyncAtomWithAction(
  init,
  JotaiUtil.composeAsyncHandlers({
    changeActivation,
    changeAvailability
  })
)

export const FeatureAtom = {
  atom: mainAtom,
  ChangeActivation: (featureName: FeatureName, activation: boolean): FeatureStateAction => ({
    type: 'changeActivation',
    featureName,
    activation
  }),
  ChangeAvailability: (featureName: FeatureName, availability: boolean): FeatureStateAction => ({
    type: 'changeAvailability',
    featureName,
    availability
  })
}
