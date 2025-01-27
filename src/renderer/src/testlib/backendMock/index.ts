import { Backend } from '../../../../common/interface'
import { MockAppSettingService } from './MockAppSettingService'
import { MockBizCardService } from './MockBizCardService'
import { MockDbSettingService } from './MockDbSettingService'
import { MockFeatureService } from './MockFeatureService'
import { MockMSExchangeIntegrationService } from './MockMSExchangeIntegrationService'
import { MockQuerySetDefinitionService } from './MockQuerySetDefinitionService'
import { MockQuerySetExecutionService } from './MockQuerySetExecutionService'
import { MockSqsMessageDefinitionService } from './MockSqsMessageDefinitionService'
import { MockSQSQueueService } from './MockSqsQueueService'
import { MockUcompanyService } from './MockUcompanyService'
import { MockUserService } from './MockUserService'

export const makeMockBackend = (waitMs: number): Backend => {
  const dbSettingService = new MockDbSettingService(waitMs)
  return {
    DbSetting: dbSettingService,
    AppSetting: new MockAppSettingService(waitMs, dbSettingService),
    Ucompany: new MockUcompanyService(waitMs),
    User: new MockUserService(waitMs),
    BizCard: new MockBizCardService(waitMs),
    Feature: new MockFeatureService(waitMs),
    MsExchangeIntegration: new MockMSExchangeIntegrationService(waitMs),
    SqsQueue: new MockSQSQueueService(waitMs),
    SqsMessageDefinition: new MockSqsMessageDefinitionService(waitMs),
    QuerySetDefinition: new MockQuerySetDefinitionService(waitMs),
    QuerySetExecution: new MockQuerySetExecutionService(waitMs)
  }
}
