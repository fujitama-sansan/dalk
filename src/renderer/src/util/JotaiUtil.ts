// noinspection JSUnusedGlobalSymbols

import { atom, Getter, Setter, WritableAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { AtomFamily } from 'jotai/vanilla/utils/atomFamily'

// Copied from jotai/core/atom.d.ts
export type Read<Value> = (get: Getter) => Value

// Copied from jotai/core/atom.d.ts
export type Write<Args extends unknown[], Result> = (
  get: Getter,
  set: Setter,
  ...args: Args
) => Result

export class ValueWithCallback<V> {
  readonly value: V | null
  readonly callback: (value: V | null) => void

  constructor(value: V | null, callback: (value: V | null) => void) {
    this.value = value
    this.callback = callback
  }
}

type HandlerResult<Value> = Value | null | ValueWithCallback<Value>

export type Handler<Value, Action> = (
  curr: Value,
  get: Getter,
  set: Setter,
  action: Action,
  store: WritableAtom<Value | null, [Value | null], void>
) => HandlerResult<Value>

const atomWithAction = <Value, Action>(
  init: Read<Value>,
  handler: Handler<Value, Action>
): WritableAtom<Value, [Action], void> => {
  const store = atom<Value | null>(null)
  const main = atom<Value, [Action], void>(
    (get) => get(store) || init(get),
    (get, set, action: Action) => {
      const resp = handler(get(main), get, set, action, store)
      if (resp instanceof ValueWithCallback) {
        set(store, resp.value)
        resp.callback(resp.value)
      } else {
        set(store, resp)
      }
    }
  )
  return main
}

export type FamilyRead<Param, Value> = (param: Param) => Read<Value>

export type FamilyHandler<Param, Value, Action> = (
  param: Param,
  storeAtom: AtomFamily<Param, WritableAtom<Value | null, [Value | null], void>>
) => Handler<Value, Action>

const atomFamilyWithAction = <Param, Value, Action>(
  init: FamilyRead<Param, Value>,
  handler: FamilyHandler<Param, Value, Action>,
  cacheOption?: CacheOption
): AtomFamily<Param, WritableAtom<Value, [Action], void>> => {
  /* eslint @typescript-eslint/no-unused-vars: 0 */
  // noinspection JSUnusedLocalSymbols
  const store = atomFamily((_param: Param) => atom<Value | null>(null))

  const main = atomFamily((param: Param) => {
    return atom<Value, [Action], void>(
      (get) => get(store(param)) || init(param)(get),
      (get, set, action: Action) => {
        const result = handler(param, store)(get(main(param)), get, set, action, store(param))
        if (result instanceof ValueWithCallback) {
          set(store(param), result.value)
          result.callback(result.value)
        } else {
          set(store(param), result)
        }
      }
    )
  })

  if (cacheOption) {
    const cs = cacheOption.size && new CacheStack<Param>(cacheOption.size)

    main.setShouldRemove((created, param) => {
      if (cacheOption.lifetimeMs) {
        const remove = Date.now() - created > cacheOption.lifetimeMs
        if (cs && remove) {
          cs.remove(param)
          return true
        }
      }
      if (cs) {
        const toBeRemoved = cs.put(param)
        if (toBeRemoved) {
          main.remove(toBeRemoved)
        }
      }
      return false
    })
  }

  return main
}

export type AsyncActionAtom<Value, Action> = WritableAtom<Promise<Value>, [Action], Promise<void>>

export type AsyncRead<Value> = (get: Getter) => Promise<Value>

// Copied from jotai/core/atom.d.ts
export type SetStateAction<Value> = Value | ((prev: Value) => Value)

export type StoreAtom<Value> = WritableAtom<Value | null, [SetStateAction<Value | null>], void>

export type AsyncHandler<Value, Action> = (
  curr: Value,
  get: Getter,
  set: Setter,
  action: Action,
  store: WritableAtom<Value | null, [Value | null], void>
) => Promise<HandlerResult<Value>> | HandlerResult<Value>

const asyncAtomWithAction = <Value, Action>(
  init: AsyncRead<Value>,
  handler: AsyncHandler<Value, Action>
): AsyncActionAtom<Value, Action> => {
  const store = atom<Value | null>(null)

  const counter = atom(1)

  const main = atom<Promise<Value>, [Action], Promise<void>>(
    async (get) => (get(counter) >= 1 && get(store)) || (await init(get)),
    async (get, set, action: Action) => {
      const result = await handler(await get(main), get, set, action, store)
      if (result === null) {
        set(counter, (c) => c + 1)
      } else if (result instanceof ValueWithCallback) {
        set(store, result.value)
        result.callback(result.value)
      } else {
        set(store, result)
      }
    }
  )
  return main
}

export type CacheOption = {
  size?: number
  lifetimeMs?: number
}

export type AsyncFamilyRead<Param, Value> = (param: Param) => AsyncRead<Value>

export type AsyncFamilyHandler<Param, Value, Action> = (
  param: Param,
  storeAtom: AtomFamily<Param, WritableAtom<Value | null, [Value | null], void>>
) => AsyncHandler<Value, Action>

const asyncAtomFamilyWithAction = <Param, Value, Action>(
  init: AsyncFamilyRead<Param, Value>,
  handler: AsyncFamilyHandler<Param, Value, Action>,
  cacheOption?: CacheOption
): AtomFamily<Param, AsyncActionAtom<Value, Action>> => {
  /* eslint @typescript-eslint/no-unused-vars: 0 */
  // noinspection JSUnusedLocalSymbols
  const store = atomFamily((_param: Param) => atom<Value | null>(null))

  const main = atomFamily((param: Param) => {
    return atom<Promise<Value>, [Action], Promise<void>>(
      async (get) => get(store(param)) || (await init(param)(get)),
      async (get, set, action: Action) => {
        const result = await handler(param, store)(
          await get(main(param)),
          get,
          set,
          action,
          store(param)
        )
        if (result instanceof ValueWithCallback) {
          set(store(param), result.value)
          result.callback(result.value)
        } else {
          set(store(param), result)
        }
      }
    )
  })

  if (cacheOption) {
    const cs = cacheOption.size && new CacheStack<Param>(cacheOption.size)

    main.setShouldRemove((created, param) => {
      if (cacheOption.lifetimeMs) {
        const remove = Date.now() - created > cacheOption.lifetimeMs
        if (cs && remove) {
          cs.remove(param)
          return true
        }
      }
      if (cs) {
        const toBeRemoved = cs.put(param)
        if (toBeRemoved) {
          main.remove(toBeRemoved)
        }
      }
      return false
    })
  }

  return main
}

export class CacheStack<T> {
  private readonly values: Array<T> = []
  private readonly size: number
  constructor(size: number) {
    this.size = size
  }
  put(accessedValue: T): T | undefined {
    const idx = this.values.indexOf(accessedValue)
    if (idx < 0) {
      this.values.push(accessedValue)
      if (this.values.length > this.size) {
        return this.values.shift()
      }
    } else if (idx !== this.values.length - 1) {
      this.values.splice(idx, 1)
      this.values.push(accessedValue)
    }
    return
  }

  remove(value: T): void {
    const idx = this.values.indexOf(value)
    if (idx >= 0) {
      this.values.splice(idx, 1)
    }
  }
}

export type TypedAction = {
  type: string
}

const composeHandlers =
  <Value, Action extends TypedAction>(
    handlers: Record<string, Handler<Value, Action>>
  ): Handler<Value, Action> =>
  (curr, get, set, action: Action, store) => {
    const handler = handlers[action.type]
    if (handler) {
      return handler(curr, get, set, action, store)
    }
    return curr
  }

const composeFamilyHandlers =
  <Param, Value, Action extends TypedAction>(
    handlers: Record<string, FamilyHandler<Param, Value, Action>>
  ): FamilyHandler<Param, Value, Action> =>
  (param, storeAtom) =>
  (curr, get, set, action, store) => {
    const handler = handlers[action.type]
    if (handler) {
      return handler(param, storeAtom)(curr, get, set, action, store)
    }
    return curr
  }

const composeAsyncHandlers =
  <Value, Action extends TypedAction>(
    handlers: Record<string, AsyncHandler<Value, Action>>
  ): AsyncHandler<Value, Action> =>
  (curr, get, set, action: Action, store) => {
    const handler = handlers[action.type]
    if (handler) {
      return handler(curr, get, set, action, store)
    }
    return curr
  }

const composeAsyncFamilyHandlers =
  <Param, Value, Action extends TypedAction>(
    handlers: Record<string, AsyncFamilyHandler<Param, Value, Action>>
  ): AsyncFamilyHandler<Param, Value, Action> =>
  (param, storeAtom) =>
  (curr, get, set, action, store) => {
    const handler = handlers[action.type]
    if (handler) {
      return handler(param, storeAtom)(curr, get, set, action, store)
    }
    return curr
  }

export const JotaiUtil = {
  atomWithAction,
  atomFamilyWithAction,
  asyncAtomWithAction,
  asyncAtomFamilyWithAction,
  composeHandlers,
  composeFamilyHandlers,
  composeAsyncHandlers,
  composeAsyncFamilyHandlers
} as const
