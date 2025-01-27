type SuccessResult<T> = Readonly<{
  success: true
  value: T
}>
type FailureResult = Readonly<{
  success: false
  error: string
}>
export type Result<T> = SuccessResult<T> | FailureResult

export function isSuccess<T>(obj: unknown): obj is SuccessResult<T> {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    (obj as SuccessResult<T>).success === true &&
    'value' in obj
  )
}

export function isFailure(obj: unknown): obj is FailureResult {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    (obj as FailureResult).success === false &&
    typeof (obj as FailureResult).error === 'string'
  )
}

export function isResult<T>(obj: unknown): obj is Result<T> {
  return isSuccess(obj) || isFailure(obj)
}

export type ResultifyFuncReturn<T> = T | Result<T> | Promise<Result<T>> | Promise<T>

export function resultifySync<T>(func: () => T): Result<T> {
  try {
    return success(func())
  } catch (error) {
    console.warn({ error })
    if (error instanceof Error) {
      return fail(error.message)
    } else {
      return fail(`Unknown error ${error}`)
    }
  }
}

export async function resultify<T>(func: () => ResultifyFuncReturn<T>): Promise<Result<T>> {
  try {
    const result = await func()
    if (isResult<T>(result)) {
      return result
    }
    return success(result)
  } catch (error) {
    //console.warn({ error })
    if (error instanceof Error) {
      return fail(error.message)
    } else {
      return fail(`Unknown error ${error}`)
    }
  }
}

export function success<T>(value: T): SuccessResult<T> {
  return { success: true, value: value as T }
}

export function fail(error: string): FailureResult {
  return { success: false, error }
}

export function composeResult<T1, T2>(r1: Result<T1>, r2: Result<T2>): Result<[T1, T2]>
export function composeResult<T1, T2, T3>(
  r1: Result<T1>,
  r2: Result<T2>,
  r3: Result<T3>
): Result<[T1, T2, T3]>
export function composeResult<T1, T2, T3, T4>(
  r1: Result<T1>,
  r2: Result<T2>,
  r3: Result<T3>,
  r4: Result<T4>
): Result<[T1, T2, T3, T4]>
export function composeResult<T1, T2, T3, T4, T5>(
  r1: Result<T1>,
  r2: Result<T2>,
  r3: Result<T3>,
  r4: Result<T4>,
  r5: Result<T5>
): Result<[T1, T2, T3, T4, T5]>
export function composeResult(...results: Result<unknown>[]): Result<unknown> {
  let success = true
  const values: unknown[] = []
  for (const r of results) {
    if (r.success) {
      values.push(r.value)
    } else {
      success = false
      return r
    }
  }
  return { success, value: values }
}

export function forResult<T1, T2>(
  func1: () => Promise<Result<T1>>,
  func2: (arg1: T1) => Promise<Result<T2>>
): Promise<Result<[T1, T2]>>
export function forResult<T1, T2, T3>(
  func1: () => Promise<Result<T1>>,
  func2: (arg1: T1) => Promise<Result<T2>>,
  func3: (arg1: T1, arg2: T2) => Promise<Result<T3>>
): Promise<Result<[T1, T2, T3]>>
export function forResult<T1, T2, T3, T4>(
  func1: () => Promise<Result<T1>>,
  func2: (arg1: T1) => Promise<Result<T2>>,
  func3: (arg1: T1, arg2: T2) => Promise<Result<T3>>,
  func4: (arg1: T1, arg2: T2, arg3: T3) => Promise<Result<T4>>
): Promise<Result<[T1, T2, T3, T4]>>
export function forResult<T1, T2, T3, T4, T5>(
  func1: () => Promise<Result<T1>>,
  func2: (arg1: T1) => Promise<Result<T2>>,
  func3: (arg1: T1, arg2: T2) => Promise<Result<T3>>,
  func4: (arg1: T1, arg2: T2, arg3: T3) => Promise<Result<T4>>,
  func5: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<Result<T5>>
): Promise<Result<[T1, T2, T3, T4, T5]>>
export async function forResult(
  ...funcs: ((...args: unknown[]) => Promise<Result<unknown>>)[]
): Promise<Result<unknown>> {
  const results: SuccessResult<unknown>[] = []
  for (const func of funcs) {
    const r = await func(...results.map((r) => r.value))
    if (!r.success) {
      return r
    } else {
      results.push(r)
    }
  }
  return { success: true, value: results.map((r) => r.value) }
}
