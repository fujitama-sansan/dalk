import { atom } from 'jotai'
import { BackendQueryExecutionEvent, QueryExecutionInput } from '../../../../common/interface'
import { AppSettingAtom } from '../../app/AppSettingAtom'
import { BackendAtom } from '../../ipc/BackendAtom'
import { AsyncHandler, FamilyHandler, FamilyRead, JotaiUtil } from '../../util/JotaiUtil'
import { ExecutionResultUtil, LineChartData, ResultData, Statistics } from './ExecutionResultUtil'

export type QueryExecutionArgs = Readonly<{
  executionId: string
  definitionId: string
  input: QueryExecutionInput
  threshold: number
  maxCount: number
}>

export type QueryExecutionInprogressState = Readonly<{
  state: 'InProgress'
  totalCompanyCount: number
  successCount: number
  recentUcompanyId: string
  allData: ReadonlyArray<ResultData>
}>

export type QueryExecutionSuccessState = Readonly<{
  state: 'Success'
  chartData: LineChartData
  statistics: Statistics
}>

export type QueryExecutionResultState =
  | Readonly<{
      state: 'Init'
    }>
  | QueryExecutionInprogressState
  | QueryExecutionSuccessState

type QueryExecutionResultAction = Readonly<
  | {
      type: 'companyFound'
      executionId: string
      companyCount: number
    }
  | {
      type: 'companySuccess'
      executionId: string
      ucompanyId: string
      time: number
      successCount: number
      result: ReadonlyArray<Record<string, unknown>>
    }
  | {
      type: 'complete'
      executionId: string
    }
  | {
      type: 'error'
      executionId: string
      ucompanyId: string
      targetParameter: string
      query: string
      params: ReadonlyArray<unknown>
      errorMessage: string
    }
  | {
      type: 'clear'
    }
>

const init: FamilyRead<string, QueryExecutionResultState> = () => () => ({
  state: 'Init'
})

const companyFound: FamilyHandler<string, QueryExecutionResultState, QueryExecutionResultAction> =
  (definitionId) => (curr, get, _set, action) => {
    const args = get(argsAtom)
    if (
      action.type === 'companyFound' &&
      args &&
      args.definitionId === definitionId &&
      args.executionId === action.executionId
    ) {
      return {
        state: 'InProgress',
        totalCompanyCount: action.companyCount,
        successCount: 0,
        recentUcompanyId: '',
        allData: []
      }
    }
    return curr
  }

const companySuccess: FamilyHandler<
  string,
  QueryExecutionResultState,
  QueryExecutionResultAction
> = (definitionId) => (curr, get, _set, action) => {
  const args = get(argsAtom)
  if (
    action.type === 'companySuccess' &&
    args &&
    args.definitionId === definitionId &&
    args.executionId === action.executionId
  ) {
    if (curr.state === 'InProgress') {
      return {
        state: 'InProgress',
        successCount: action.successCount,
        totalCompanyCount: curr.totalCompanyCount,
        recentUcompanyId: action.ucompanyId,
        allData: curr.allData.toSpliced(curr.allData.length, 0, {
          success: true,
          ucompanyId: action.ucompanyId,
          time: action.time
        })
      }
    }
  }
  return curr
}

const complete: FamilyHandler<string, QueryExecutionResultState, QueryExecutionResultAction> =
  (definitionId) => (curr, get, set, action) => {
    const args = get(argsAtom)
    if (
      action.type === 'complete' &&
      args &&
      args.definitionId === definitionId &&
      args.executionId === action.executionId
    ) {
      set(argsAtom, null)
      if (curr.state === 'InProgress') {
        return {
          state: 'Success',
          chartData: ExecutionResultUtil.makeChartData(curr.allData, args.threshold, args.maxCount),
          statistics: ExecutionResultUtil.makeStatistics(curr.allData)
        }
      }
    }
    return curr
  }

const error: FamilyHandler<string, QueryExecutionResultState, QueryExecutionResultAction> =
  (definitionId) => (curr, get, _set, action) => {
    const args = get(argsAtom)
    if (
      action.type === 'error' &&
      args &&
      args.definitionId === definitionId &&
      args.executionId === action.executionId
    ) {
      console.warn('Error reported', action)
      if (curr.state === 'InProgress') {
        return {
          state: 'InProgress',
          successCount: curr.successCount,
          totalCompanyCount: curr.totalCompanyCount,
          recentUcompanyId: action.ucompanyId,
          allData: curr.allData.toSpliced(curr.allData.length, 0, {
            success: false,
            ucompanyId: action.ucompanyId,
            errorMessage: action.errorMessage
          })
        }
      }
    }
    return curr
  }

const clear: FamilyHandler<string, QueryExecutionResultState, QueryExecutionResultAction> =
  () => () => ({
    state: 'Init'
  })

const resultAtom = JotaiUtil.atomFamilyWithAction(
  init,
  JotaiUtil.composeFamilyHandlers({
    companyFound,
    companySuccess,
    complete,
    error,
    clear
  })
)

const argsAtom = atom<QueryExecutionArgs | null>(null)

type ExecutionAction = Readonly<
  | {
      type: 'start'
      definitionId: string
      input: QueryExecutionInput
      threshold: number
      maxCount: number
    }
  | {
      type: 'stop'
      definitionId: string
    }
>

const start: AsyncHandler<null, ExecutionAction> = async (curr, get, set, action) => {
  if (action.type === 'start') {
    const setting = await get(AppSettingAtom.atom)
    if (setting.state !== 'Complete') {
      throw new Error('AppSetting is not complete')
    }
    const { definitionId, input, threshold, maxCount } = action
    const svc = get(BackendAtom.atom).QuerySetExecution
    const result = await svc.execute(setting.data.dbSettingId, input)
    if (result.success) {
      set(argsAtom, {
        executionId: result.value,
        definitionId,
        input,
        threshold,
        maxCount
      })
    } else {
      set(argsAtom, null)
      console.warn(result.error)
    }
  }
  return curr
}

const stop: AsyncHandler<null, ExecutionAction> = async (curr, get, set, action) => {
  if (action.type === 'stop') {
    const svc = get(BackendAtom.atom).QuerySetExecution
    const args = get(argsAtom)
    if (args && args.definitionId === action.definitionId) {
      await svc.stop(args.executionId)
      set(argsAtom, null)
      await set(resultAtom(args.definitionId), { type: 'clear' })
    }
  }
  return curr
}

const mainAtom = JotaiUtil.asyncAtomWithAction<null, ExecutionAction>(
  () => Promise.resolve(null),
  JotaiUtil.composeAsyncHandlers({ start, stop })
)

export const QueryExecutionAtom = {
  resultAtom,
  argsAtom,
  atom: mainAtom,
  Start: (
    definitionId: string,
    input: QueryExecutionInput,
    threshold: number,
    maxCount: number
  ): ExecutionAction => ({
    type: 'start',
    definitionId,
    input,
    threshold,
    maxCount
  }),
  Stop: (definitionId: string): ExecutionAction => ({
    type: 'stop',
    definitionId
  }),
  OnEvent: (event: BackendQueryExecutionEvent): QueryExecutionResultAction => {
    switch (event.event) {
      case 'start':
        return {
          type: 'companyFound',
          executionId: event.executionId,
          companyCount: 1
        }
      case 'companiesFound':
        return {
          type: 'companyFound',
          executionId: event.executionId,
          companyCount: event.companyCount
        }
      case 'ucompanySuccess':
        return {
          type: 'companySuccess',
          executionId: event.executionId,
          ucompanyId: event.ucompanyId,
          time: event.time,
          successCount: event.successCount,
          result: event.result
        }
      case 'end':
        return {
          type: 'complete',
          executionId: event.executionId
        }
      case 'error':
        return {
          type: 'error',
          executionId: event.executionId,
          ucompanyId: event.ucompanyId,
          targetParameter: event.targetParameter,
          query: event.query,
          params: event.params,
          errorMessage: event.errorMessage
        }
    }
  }
} as const
