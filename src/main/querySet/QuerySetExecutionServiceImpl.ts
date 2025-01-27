import { BackendEventConst, QuerySetExecutionService } from '../../common/interface'
import { QueryExecutionInput } from '../../common/interface/QuerySetDefinition'
import { Result, resultify } from '../../common/util/Result'
import { EventDispatcher } from '../EventDispatcher'
import { DbSettingRepository } from '../db/DbSettingRepository'
import { IdGenerator } from '../util/IdGenerator'
import { QuerySetExecutor } from './QuerySetExecutor'

export class QuerySetExecutionServiceImpl implements QuerySetExecutionService {
  constructor(
    private readonly idGenerator: IdGenerator,
    private readonly dbSettingRepository: DbSettingRepository
  ) {}

  execute(dbSettingId: string, input: QueryExecutionInput): Promise<Result<string>> {
    const executionId = this.idGenerator.generate()
    const eventType = BackendEventConst.types.QueryExecution
    return resultify(async () => {
      const setting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      EventDispatcher.dispatch({
        type: eventType,
        executionId,
        event: 'start'
      })
      QuerySetExecutor.executeSQL(executionId, setting, input, {
        onCompaniesFound: (companyCount) => {
          EventDispatcher.dispatch({
            type: eventType,
            executionId,
            event: 'companiesFound',
            companyCount
          })
        },
        onSuccess: (ucompanyId, records, time, successCount) => {
          EventDispatcher.dispatch({
            type: eventType,
            executionId,
            event: 'ucompanySuccess',
            ucompanyId,
            time,
            successCount,
            result: records
          })
        },
        onError: (ucompanyId, targetParameter, query, params, errorMessage) => {
          EventDispatcher.dispatch({
            type: eventType,
            executionId,
            event: 'error',
            ucompanyId,
            targetParameter,
            query,
            params,
            errorMessage
          })
        },
        onComplete: () => {
          EventDispatcher.dispatch({
            type: eventType,
            executionId,
            event: 'end'
          })
        }
      })
      return executionId
    })
  }

  stop(executionId: string): Promise<Result<void>> {
    return resultify(async () => {
      QuerySetExecutor.stop(executionId)
    })
  }
}
