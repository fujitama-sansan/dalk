import { notImpl } from '../util/Nop'
import { Result } from '../util/Result'
import { User } from './User'

export type MsExchangeFetchSchedule = Readonly<{
  ucompanyId: string
  credentialId: string
  userUuid: string
  lastFetchTimestamp: Date | null
  fetchStatus: number
}>

export type MsExchangeCredential = Readonly<{
  ucompanyId: string
  billingGroupId: string
  tenantId: string
  credentialId: string
}>

export type MsExchangeIntegrationInfo = Readonly<{
  credential: MsExchangeCredential
  fetchSchedule: MsExchangeFetchSchedule
}>

export interface MsExchangeIntegrationService {
  get(
    dbSettingId: string,
    ucompanyId: string,
    billingGroupId: string,
    userUuid: string
  ): Promise<Result<MsExchangeIntegrationInfo | null>>

  changeLastFetchTimestamp(
    dbSettingId: string,
    ucompanyId: string,
    credentialId: string,
    userUuid: string,
    operatorUser: User,
    lastFetchTimestamp: Date | null
  ): Promise<Result<void>>
}

export const fakeMsExchangeIntegrationService: MsExchangeIntegrationService = {
  get: notImpl,
  changeLastFetchTimestamp: notImpl
} as const
