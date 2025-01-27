import {
  DbSetting,
  MsExchangeCredential,
  MsExchangeFetchSchedule,
  MsExchangeIntegrationInfo,
  MsExchangeIntegrationService,
  User
} from '../../common/interface'
import { Result, resultify } from '../../common/util/Result'
import { DataPrismaAccessor } from '../db/DataPrismaAccessor'
import { DbSettingRepository } from '../db/DbSettingRepository'
import { LkDbUtil } from '../db/LkDbUtil'

export class MsExchangeIntegrationServiceImpl implements MsExchangeIntegrationService {
  constructor(readonly dbSettingRepository: DbSettingRepository) {}

  get(
    dbSettingId: string,
    ucompanyId: string,
    billingGroupId: string,
    userUuid: string
  ): Promise<Result<MsExchangeIntegrationInfo | null>> {
    return resultify(async () => {
      const dbSetting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      const credential = await this.getCredential(dbSetting, ucompanyId, billingGroupId)
      if (!credential) {
        return null
      }
      const fetchSchedule = await this.getFetchSchedule(
        dbSetting,
        ucompanyId,
        credential.credentialId,
        userUuid
      )
      if (!fetchSchedule) {
        return null
      }
      return {
        credential,
        fetchSchedule
      } satisfies MsExchangeIntegrationInfo
    })
  }

  changeLastFetchTimestamp(
    dbSettingId: string,
    ucompanyId: string,
    credentialId: string,
    userUuid: string,
    operatorUser: User,
    lastFetchTimestamp: Date | null
  ): Promise<Result<void>> {
    return resultify(async () => {
      const dbSetting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
      await prisma.trn_transcription_msexchange_fetch_schedule.update({
        where: {
          ucompany_id_user_uuid_msexchange_credential_id: {
            ucompany_id: ucompanyId,
            msexchange_credential_id: credentialId,
            user_uuid: userUuid
          }
        },
        data: {
          ...LkDbUtil.makePartialDataForUpdate(operatorUser),
          last_fetch_timestamp: lastFetchTimestamp
        }
      })
    })
  }

  private async getCredential(
    dbSetting: DbSetting,
    ucompanyId: string,
    billingGroupId: string
  ): Promise<MsExchangeCredential | null> {
    const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
    const record = await prisma.mst_transcription_mail_msexchange_credential.findUnique({
      where: {
        ucompany_id_billing_group_id: {
          ucompany_id: ucompanyId,
          billing_group_id: billingGroupId
        }
      }
    })
    if (record) {
      return {
        ucompanyId: record.ucompany_id,
        billingGroupId: record.billing_group_id,
        tenantId: record.msexchange_tenant_id,
        credentialId: record.msexchange_credential_id
      } satisfies MsExchangeCredential
    } else {
      return null
    }
  }

  private async getFetchSchedule(
    dbSetting: DbSetting,
    ucompanyId: string,
    credentialId: string,
    userUuid: string
  ): Promise<MsExchangeFetchSchedule | null> {
    const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
    const record = await prisma.trn_transcription_msexchange_fetch_schedule.findUnique({
      where: {
        ucompany_id_user_uuid_msexchange_credential_id: {
          ucompany_id: ucompanyId,
          msexchange_credential_id: credentialId,
          user_uuid: userUuid
        }
      }
    })
    if (record) {
      return {
        credentialId: record.msexchange_credential_id,
        ucompanyId: record.ucompany_id,
        userUuid: record.user_uuid,
        lastFetchTimestamp: record.last_fetch_timestamp,
        fetchStatus: record.fetch_status
      } satisfies MsExchangeFetchSchedule
    } else {
      return null
    }
  }
}
