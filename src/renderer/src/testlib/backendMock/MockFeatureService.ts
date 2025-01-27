import {
  AllFeatures,
  FeatureEntry,
  FeatureName,
  FeatureService,
  User
} from '../../../../common/interface'
import { Result } from '../../../../common/util/Result'
import { MockUtil } from './MockUtil'

export class MockFeatureService implements FeatureService {
  private readonly util: MockUtil
  constructor(waitMs: number) {
    this.util = new MockUtil('Feature', waitMs)
  }

  getAll(
    _dbSettingId: string,
    ucompanyId: string,
    billingGroupId: string
  ): Promise<Result<ReadonlyArray<FeatureEntry>>> {
    return this.util.wrap(
      'getAll',
      async () => {
        const keys = Object.keys(AllFeatures) as FeatureName[]
        return keys.map(
          (name, i) =>
            ({
              name,
              commonActivated: i % 5 === 0,
              mstAvailable: i % 4 === 0,
              commonAvailable: i % 3 === 0,
              mstActivated: i % 2 === 0
            }) satisfies FeatureEntry
        )
      },
      { ucompanyId, billingGroupId }
    )
  }

  makeAvailable(
    _dbSettingId: string,
    _ucompanyId: string,
    _operatorUser: User,
    _billingGroupId: string,
    featureName: FeatureName
  ): Promise<Result<boolean>> {
    return this.util.wrap('makeAvailable', () => true, { featureName })
  }

  makeUnavailable(
    _dbSettingId: string,
    _ucompanyId: string,
    _operatorUser: User,
    _billingGroupId: string,
    featureName: FeatureName
  ): Promise<Result<boolean>> {
    return this.util.wrap('makeUnavailable', () => true, { featureName })
  }

  activate(
    _dbSettingId: string,
    _ucompanyId: string,
    _operatorUser: User,
    _billingGroupId: string,
    featureName: FeatureName
  ): Promise<Result<boolean>> {
    return this.util.wrap('activate', () => true, { featureName })
  }

  deactivate(
    _dbSettingId: string,
    _ucompanyId: string,
    _operatorUser: User,
    _billingGroupId: string,
    featureName: FeatureName
  ): Promise<Result<boolean>> {
    return this.util.wrap('deactivate', () => true, { featureName })
  }
}
