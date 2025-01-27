import { v4 as uuidv4 } from 'uuid'
import {
  AllFeatures,
  DbSetting,
  FeatureEntry,
  FeatureName,
  FeatureService,
  User
} from '../../common/interface'
import { Result, resultify } from '../../common/util/Result'
import { DataPrismaAccessor } from '../db/DataPrismaAccessor'
import { DbSettingRepository } from '../db/DbSettingRepository'
import { LkDbUtil } from '../db/LkDbUtil'

const allFeatureNames = Object.keys(AllFeatures) as ReadonlyArray<FeatureName>

const isFeatureName = (name: string): name is FeatureName =>
  (allFeatureNames as string[]).includes(name)

const cmnLkAvailabilitiesCache = new Map<string, FeatureName[]>()

const cmnLkActivationsCache = new Map<string, FeatureName[]>()

export class FeatureServiceImpl implements FeatureService {
  constructor(private readonly dbSettingRepository: DbSettingRepository) {}

  getAll(
    dbSettingId: string,
    ucompanyId: string,
    billingGroupId: string
  ): Promise<Result<ReadonlyArray<FeatureEntry>>> {
    return resultify(async () => {
      const dbSetting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      const cmnLkAvailableNames = await getCmnLkAvailableNames(dbSetting, ucompanyId)
      const cmnLkActivatedNames = await getCmnLkActivatedNames(dbSetting, ucompanyId)
      const now = new Date()
      const active = isActive(now)
      const available = isAvailable(now)
      const mstAvailabilities = new Map<FeatureName, boolean>(
        (await getMstAvailabilities(dbSetting, ucompanyId, billingGroupId)).map((record) => [
          record.featureName,
          available(record)
        ])
      )
      const mstActivations = new Map<FeatureName, boolean>(
        (await getMstActivations(dbSetting, ucompanyId, billingGroupId)).map((record) => [
          record.featureName,
          active(record)
        ])
      )
      return allFeatureNames.map(
        (name) =>
          ({
            name,
            commonAvailable: cmnLkAvailableNames.includes(name),
            commonActivated: cmnLkActivatedNames.includes(name),
            mstAvailable: !!mstAvailabilities.get(name),
            mstActivated: !!mstActivations.get(name)
          }) satisfies FeatureEntry
      )
    })
  }

  makeAvailable(
    dbSettingId: string,
    ucompanyId: string,
    operatorUser: User,
    billingGroupId: string,
    featureName: FeatureName
  ): Promise<Result<boolean>> {
    return resultify(async () => {
      const dbSetting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      if ((await getCmnLkAvailableNames(dbSetting, ucompanyId)).includes(featureName)) {
        return true
      }

      const mstRecord = (await getMstAvailabilities(dbSetting, ucompanyId, billingGroupId)).find(
        (r) => r.featureName === featureName
      )

      const now = new Date()

      if (!mstRecord) {
        await createMstAvailability(
          dbSetting,
          ucompanyId,
          operatorUser,
          now,
          billingGroupId,
          featureName
        )
      } else if (!isAvailable(now)(mstRecord)) {
        await updateMstAvailability(
          dbSetting,
          ucompanyId,
          operatorUser,
          now,
          billingGroupId,
          featureName,
          true
        )
      }
      return true
    })
  }

  makeUnavailable(
    dbSettingId: string,
    ucompanyId: string,
    operatorUser: User,
    billingGroupId: string,
    featureName: FeatureName
  ): Promise<Result<boolean>> {
    return resultify(async () => {
      const dbSetting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      if ((await getCmnLkAvailableNames(dbSetting, ucompanyId)).includes(featureName)) {
        return true
      }
      const mstRecord = (await getMstAvailabilities(dbSetting, ucompanyId, billingGroupId)).find(
        (r) => r.featureName === featureName
      )

      const now = new Date()

      if (isAvailable(now)(mstRecord)) {
        await updateMstAvailability(
          dbSetting,
          ucompanyId,
          operatorUser,
          now,
          billingGroupId,
          featureName,
          false
        )
      }
      return false
    })
  }

  activate(
    dbSettingId: string,
    ucompanyId: string,
    operatorUser: User,
    billingGroupId: string,
    featureName: FeatureName
  ): Promise<Result<boolean>> {
    return resultify(async () => {
      const dbSetting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      if ((await getCmnLkActivatedNames(dbSetting, ucompanyId)).includes(featureName)) {
        return true
      }
      const mstRecord = (await getMstActivations(dbSetting, ucompanyId, billingGroupId)).find(
        (r) => r.featureName === featureName
      )
      const now = new Date()
      if (!mstRecord) {
        await createMstActivation(
          dbSetting,
          ucompanyId,
          operatorUser,
          now,
          billingGroupId,
          featureName
        )
      } else if (!isActive(now)(mstRecord)) {
        await updateMstActivation(
          dbSetting,
          ucompanyId,
          operatorUser,
          now,
          mstRecord.featureActivationId,
          true
        )
      }
      return true
    })
  }

  deactivate(
    dbSettingId: string,
    ucompanyId: string,
    operatorUser: User,
    billingGroupId: string,
    featureName: FeatureName
  ): Promise<Result<boolean>> {
    return resultify(async () => {
      const dbSetting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      if ((await getCmnLkActivatedNames(dbSetting, ucompanyId)).includes(featureName)) {
        return true
      }

      const now = new Date()

      const mstRecord = (await getMstActivations(dbSetting, ucompanyId, billingGroupId)).find(
        (r) => r.featureName === featureName
      )
      if (mstRecord && isActive(now)(mstRecord)) {
        await updateMstActivation(
          dbSetting,
          ucompanyId,
          operatorUser,
          now,
          mstRecord.featureActivationId,
          false
        )
      }
      return false
    })
  }
}

const getCmnLkAvailableNames = async (
  dbSetting: DbSetting,
  ucompanyId: string
): Promise<ReadonlyArray<FeatureName>> => {
  if (cmnLkAvailabilitiesCache.has(dbSetting.id)) {
    return cmnLkAvailabilitiesCache.get(dbSetting.id)!
  }
  const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
  const names = (await prisma.cmn_lk_feature_availability.findMany()).map((r) => r.feature_name)
  const availabilities = allFeatureNames.filter((name) => names.includes(name))
  cmnLkAvailabilitiesCache.set(dbSetting.id, availabilities)
  return availabilities
}

const getCmnLkActivatedNames = async (
  dbSetting: DbSetting,
  ucompanyId: string
): Promise<ReadonlyArray<FeatureName>> => {
  if (cmnLkActivationsCache.has(dbSetting.id)) {
    return cmnLkActivationsCache.get(dbSetting.id)!
  }
  const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
  const names = (await prisma.cmn_lk_feature_activation.findMany()).map((r) => r.feature_name)
  const activations = allFeatureNames.filter((name) => names.includes(name))
  cmnLkActivationsCache.set(dbSetting.id, activations)
  return activations
}

type AvailabilityRecord = {
  featureName: FeatureName
  effectiveFrom: Date
  effectiveTo: Date | null
}

const isAvailable =
  (now: Date) =>
  (ar: AvailabilityRecord | undefined): boolean =>
    !!ar && ar.effectiveFrom < now && (!ar.effectiveTo || now < ar.effectiveTo)

const getMstAvailabilities = async (
  dbSetting: DbSetting,
  ucompanyId: string,
  billingGroupId: string
): Promise<ReadonlyArray<AvailabilityRecord>> => {
  const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
  const records = await prisma.mst_feature_availability.findMany({
    where: {
      ucompany_id: ucompanyId,
      billing_group_id: billingGroupId
    }
  })
  return records
    .filter((r) => isFeatureName(r.feature_name))
    .map(
      (r) =>
        ({
          featureName: r.feature_name as FeatureName,
          effectiveFrom: r.effective_from,
          effectiveTo: r.effective_to
        }) satisfies AvailabilityRecord
    )
}

type ActivationRecord = {
  featureName: FeatureName
  activateTimestamp: Date
  deactivateTimestamp: Date | null
  featureActivationId: string
}

const isActive =
  (now: Date) =>
  (record: ActivationRecord | undefined): boolean =>
    !!record &&
    record.activateTimestamp < now &&
    (!record.deactivateTimestamp || now < record.deactivateTimestamp)

const getMstActivations = async (
  dbSetting: DbSetting,
  ucompanyId: string,
  billingGroupId: string
): Promise<ReadonlyArray<ActivationRecord>> => {
  const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
  const records = await prisma.mst_feature_activation.findMany({
    where: {
      ucompany_id: ucompanyId,
      billing_group_id: billingGroupId
    }
  })
  return records
    .filter((r) => isFeatureName(r.feature_name))
    .map(
      (r) =>
        ({
          featureName: r.feature_name as FeatureName,
          activateTimestamp: r.activate_timestamp,
          deactivateTimestamp: r.deactivate_timestamp,
          featureActivationId: r.feature_activation_id
        }) satisfies ActivationRecord
    )
}

const createMstAvailability = async (
  dbSetting: DbSetting,
  ucompanyId: string,
  operatorUser: User,
  now: Date,
  billingGroupId: string,
  featureName: FeatureName
): Promise<void> => {
  const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
  await prisma.mst_feature_availability.create({
    data: {
      ...LkDbUtil.makePartialDataForCreate(operatorUser, now),
      ucompany_id: ucompanyId,
      billing_group_id: billingGroupId,
      feature_name: featureName,
      effective_from: new Date(now.getTime() - 3600 * 1000),
      effective_to: null
    }
  })
}

const updateMstAvailability = async (
  dbSetting: DbSetting,
  ucompanyId: string,
  operatorUser: User,
  now: Date,
  billingGroupId: string,
  featureName: FeatureName,
  availability: boolean
): Promise<void> => {
  const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
  await prisma.mst_feature_availability.update({
    data: {
      ...LkDbUtil.makePartialDataForUpdate(operatorUser, now),
      effective_from: new Date(now.getTime() - 3600 * 1000),
      effective_to: availability ? null : new Date(now.getTime() - 3600 * 1000)
    },
    where: {
      ucompany_id_billing_group_id_feature_name: {
        ucompany_id: ucompanyId,
        billing_group_id: billingGroupId,
        feature_name: featureName
      }
    }
  })
}

const createMstActivation = async (
  dbSetting: DbSetting,
  ucompanyId: string,
  operatorUser: User,
  now: Date,
  billingGroupId: string,
  featureName: FeatureName
): Promise<void> => {
  const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
  await prisma.mst_feature_activation.create({
    data: {
      ...LkDbUtil.makePartialDataForCreate(operatorUser, now),
      ucompany_id: ucompanyId,
      billing_group_id: billingGroupId,
      feature_name: featureName,
      feature_activation_id: uuidv4(),
      activate_timestamp: new Date(now.getTime() - 1000 * 3600),
      deactivate_timestamp: null
    }
  })
}

const updateMstActivation = async (
  dbSetting: DbSetting,
  ucompanyId: string,
  operatorUser: User,
  now: Date,
  featureActivationId: string,
  activation: boolean
): Promise<void> => {
  const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
  await prisma.mst_feature_activation.update({
    data: {
      ...LkDbUtil.makePartialDataForUpdate(operatorUser, now),
      activate_timestamp: new Date(now.getTime() - 1000 * 3600),
      deactivate_timestamp: activation ? null : new Date(now.getTime() - 1000 * 3600)
    },
    where: {
      feature_activation_id: featureActivationId
    }
  })
}
