import { notImpl } from '../util/Nop'

export type BackendQueryExecutionEvent = {
  type: 'QueryExecution'
  executionId: string
} & (
  | {
      event: 'start' | 'end'
    }
  | {
      event: 'companiesFound'
      companyCount: number
    }
  | {
      event: 'ucompanySuccess'
      ucompanyId: string
      successCount: number
      time: number
      result: ReadonlyArray<Record<string, unknown>>
    }
  | {
      event: 'error'
      ucompanyId: string
      errorMessage: string
      query: string
      params: ReadonlyArray<unknown>
      targetParameter: string
    }
)

export type BackendEvent = BackendQueryExecutionEvent

export type BackendEventListenFunction<T extends BackendEvent = BackendEvent> = (event: T) => void

export type BackendEventApi = {
  listen: <T extends BackendEvent>(type: T['type'], func: BackendEventListenFunction<T>) => void
  release: <T extends BackendEvent>(type: T['type']) => void
}

export const fakeBackendEventApi: BackendEventApi = {
  listen: notImpl,
  release: notImpl
} as const

export const BackendEventConst = {
  types: {
    QueryExecution: 'QueryExecution'
  } satisfies Record<string, BackendEvent['type']>
} as const
