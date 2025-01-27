import { AppSettingService, fakeAppSettingService } from './AppSettingData'
import { BizCardService, FakeBizCardService } from './BizCard'
import { DbSettingService, fakeDbSettingService } from './DbSetting'
import { FeatureService, fakeFeatureService } from './Features'
import {
  MsExchangeIntegrationService,
  fakeMsExchangeIntegrationService
} from './MsExchangeIntegration'
import {
  QuerySetDefinitionService,
  QuerySetExecutionService,
  fakeQuerySetDefinitionService,
  fakeQuerySetExecutionService
} from './QuerySetDefinition'
import {
  SqsMessageDefinitionService,
  SqsQueueService,
  fakeSqsMesssageDefinitionService,
  fakeSqsQueueService
} from './Sqs'
import { UcompanyService, fakeUcompanyService } from './Ucompany'
import { UserService, fakeUserService } from './User'

export type Backend = Readonly<{
  DbSetting: DbSettingService
  AppSetting: AppSettingService
  Ucompany: UcompanyService
  User: UserService
  BizCard: BizCardService
  Feature: FeatureService
  MsExchangeIntegration: MsExchangeIntegrationService
  SqsQueue: SqsQueueService
  SqsMessageDefinition: SqsMessageDefinitionService
  QuerySetDefinition: QuerySetDefinitionService
  QuerySetExecution: QuerySetExecutionService
}>

export type BackendDomain = keyof Backend

export type BackendMethodName<D extends BackendDomain> = keyof Backend[D]

export const fakeBackend: Backend = {
  DbSetting: fakeDbSettingService,
  AppSetting: fakeAppSettingService,
  Ucompany: fakeUcompanyService,
  User: fakeUserService,
  BizCard: FakeBizCardService,
  Feature: fakeFeatureService,
  MsExchangeIntegration: fakeMsExchangeIntegrationService,
  SqsQueue: fakeSqsQueueService,
  SqsMessageDefinition: fakeSqsMesssageDefinitionService,
  QuerySetDefinition: fakeQuerySetDefinitionService,
  QuerySetExecution: fakeQuerySetExecutionService
} as const

export type BackendMessage<D extends BackendDomain, M extends BackendMethodName<D>> = Readonly<{
  domain: D
  method: M
  args: unknown[]
}>

export const isBackendMessage = <D extends BackendDomain, M extends BackendMethodName<D>>(
  obj: unknown
): obj is BackendMessage<D, M> => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof (obj as BackendMessage<D, M>).domain === 'string' &&
    typeof (obj as BackendMessage<D, M>).method === 'string' &&
    Array.isArray((obj as BackendMessage<D, M>).args)
  )
}

export const BackendChannel = {
  channelName: 'backend'
} as const
