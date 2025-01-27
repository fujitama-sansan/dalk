import { DbSetting, QueryExecutionInput, QuerySetDefinitionUtil } from '../../common/interface'
import { DataPrismaAccessor, DataPrismaClient } from '../db/DataPrismaAccessor'

type Records = ReadonlyArray<Record<string, unknown>>

type Listener = {
  onCompaniesFound: (companyCount: number) => void
  onSuccess: (ucompanyId: string, records: Records, time: number, successCount: number) => void
  onComplete: () => void
  onError: (
    ucompanyId: string,
    targetParameter: string,
    query: string,
    params: unknown[],
    errorMessage: string
  ) => void
}

class QuerySetExecutorError extends Error {
  readonly ucompanyId: string
  readonly query: string
  readonly targetParameter: string
  readonly params: unknown[]
  constructor(
    message: string,
    ucompanyId: string,
    targetParameter: string,
    query: string,
    params: unknown[]
  ) {
    super(message)
    this.name = 'QuerySetExecutorError'
    this.ucompanyId = ucompanyId
    this.query = query
    this.targetParameter = targetParameter
    this.params = params
  }
}

class ExecutionCancelError extends Error {
  constructor() {
    super('Execution stopped')
    this.name = 'ExecutionCancelError'
  }
}

let executingId: string | null = null

const executeSQL = async (
  executionId: string,
  dbSetting: DbSetting,
  input: QueryExecutionInput,
  listener: Listener
): Promise<void> => {
  executingId = executionId
  try {
    const ucompanyIds = await DataPrismaAccessor.getAvailableUcompanyIds(
      dbSetting,
      input.ucompanyIds
    )
    listener.onCompaniesFound(ucompanyIds.length)
    let successCount = 0
    for (const ucompanyId of ucompanyIds) {
      if (executingId !== executionId) {
        throw new ExecutionCancelError()
      }
      try {
        const dc = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
        await resolveTarget<Records>(
          dc,
          '',
          executionId,
          input,
          new Map([['UcompanyId', ucompanyId]]),
          (result, time) => {
            listener.onSuccess(ucompanyId, result, time, ++successCount)
          }
        )
      } catch (e) {
        if (e instanceof QuerySetExecutorError) {
          listener.onError(e.ucompanyId, e.targetParameter, e.query, e.params, e.message)
        } else {
          throw e
        }
      }
    }
  } catch (e) {
    if (e instanceof ExecutionCancelError) {
      console.log('Execution stopped')
      return
    } else if (e instanceof QuerySetExecutorError) {
      listener.onError(e.ucompanyId, e.targetParameter, e.query, e.params, e.message)
    } else {
      console.warn(e)
    }
  }
  listener.onComplete()
}

const resolveTarget = async <T = unknown>(
  dc: DataPrismaClient,
  targetParameter: string,
  executionId: string,
  input: QueryExecutionInput,
  resolved: Map<string, unknown>,
  callback?: (result: T, time: number) => void
): Promise<T> => {
  if (executingId !== executionId) {
    throw new Error('Execution stopped')
  } else if (resolved.has(targetParameter)) {
    return resolved.get(targetParameter) as T
  } else {
    const query = input.queries.find((q) => q.targetParameter === targetParameter)
    if (!query) {
      throw new Error(`Query not found for target parameter: ${targetParameter}`)
    }
    if (query.query.match(/\bselect\b/i)) {
      const paramNames = QuerySetDefinitionUtil.collectParameterNames(query.query)
      const paramValues = []
      let replacedQuery: string = query.query
      let i = 1
      for (const pn of paramNames) {
        replacedQuery = replacedQuery.replace(new RegExp('@' + pn, 'g'), `$${i++}`)
        paramValues.push(await resolveTarget(dc, pn, executionId, input, resolved))
      }
      try {
        const begin = Date.now()
        console.log('Executing:', replacedQuery, paramValues)
        const result = transformResult<T>(
          await dc.$queryRawUnsafe<T>(replacedQuery, ...paramValues)
        )
        const end = Date.now()
        console.log(`Finished in (${end - begin} ms).  Result:`, result)
        if (callback) {
          callback(result, end - begin)
        }
        resolved.set(targetParameter, result)
        return result as T
      } catch (e) {
        if (e instanceof Error) {
          throw new QuerySetExecutorError(
            e.message,
            resolved.get('UcompanyId') as string,
            targetParameter,
            replacedQuery,
            paramValues
          )
        } else {
          throw e
        }
      }
    } else {
      return query.query as T
    }
  }
}

const transformResult = <T = unknown>(result: unknown): T => {
  if (Array.isArray(result) && result.length == 1) {
    const entries = Object.entries(result[0])
    if (entries.length === 1) {
      return entries[0][1] as T
    }
  }
  return result as T
}

const stop = (executionId: string): void => {
  if (executingId === executionId) {
    executingId = null
  }
}

export const QuerySetExecutor = {
  executeSQL,
  stop
}

export const QuerySetExecutorForTestOnly = {
  resolveTarget,
  transformResult,
  executeSQL
}
