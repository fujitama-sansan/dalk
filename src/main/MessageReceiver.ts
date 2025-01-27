import { ipcMain } from 'electron'
import type { Backend } from '../common/interface'
import { BackendChannel, isBackendMessage } from '../common/interface'
import { AppSettingServiceImpl } from './appSetting/AppSettingServiceImpl'
import { BizCardServiceImpl } from './bizcard/BizCardServiceImpl'
import { DbSettingRepository } from './db/DbSettingRepository'
import { DbSettingServiceImpl } from './db/DbSettingServiceImpl'
import { FeatureServiceImpl } from './feature/FeatureServiceImpl'
import { MsExchangeIntegrationServiceImpl } from './integration/MsExchangeIntegrationServiceImpl'
import { QuerySetDefinitionServiceImpl } from './querySet/QuerySetDefinitionServiceImpl'
import { QuerySetExecutionServiceImpl } from './querySet/QuerySetExecutionServiceImpl'
import { SqsMessageDefinitionServiceImpl } from './sqs/SqsMessageDefinitionServiceImpl'
import { SqsQueueServiceImpl } from './sqs/SqsQueueServiceImpl'
import { UcompanyServiceImpl } from './ucompany/UcompanyServiceImpl'
import { UserServiceImpl } from './user/UserServiceImpl'
import { GuidGenerator } from './util/GuidGenerator'

const buildMainBackend = (): Backend => {
  const idGenerator = new GuidGenerator()
  const dbSettingRepository = DbSettingRepository.create()

  return {
    DbSetting: new DbSettingServiceImpl(idGenerator),
    AppSetting: new AppSettingServiceImpl(),
    Ucompany: new UcompanyServiceImpl(dbSettingRepository),
    User: new UserServiceImpl(dbSettingRepository),
    BizCard: new BizCardServiceImpl(dbSettingRepository),
    Feature: new FeatureServiceImpl(dbSettingRepository),
    MsExchangeIntegration: new MsExchangeIntegrationServiceImpl(dbSettingRepository),
    SqsQueue: new SqsQueueServiceImpl(),
    SqsMessageDefinition: new SqsMessageDefinitionServiceImpl(idGenerator),
    QuerySetDefinition: new QuerySetDefinitionServiceImpl(idGenerator),
    QuerySetExecution: new QuerySetExecutionServiceImpl(idGenerator, dbSettingRepository)
  }
}

let started = false

const start = (): void => {
  if (started) {
    return
  }
  const backend = buildMainBackend()
  ipcMain.handle(BackendChannel.channelName, (_evt, message) => {
    if (isBackendMessage(message)) {
      const service = backend[message.domain]
      const method = service[message.method] as (...args: unknown[]) => unknown
      return method.apply(service, message.args)
    }
    console.warn('Backend message not recognized:', message)
    return null
  })
  console.log('MessageReceiver started')
  started = true
}

export const MessageReceiver = {
  start
} as const
