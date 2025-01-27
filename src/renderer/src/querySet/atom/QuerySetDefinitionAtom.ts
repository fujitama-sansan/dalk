import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { EntityInput, QuerySetDefinition } from '../../../../common/interface'
import { BackendAtom } from '../../ipc/BackendAtom'
import {
  AsyncFamilyHandler,
  AsyncFamilyRead,
  AsyncHandler,
  AsyncRead,
  JotaiUtil
} from '../../util/JotaiUtil'

type ListState = {
  items: ReadonlyArray<QuerySetDefinition>
  error?: string
}

type ListAction =
  | {
      type: 'create'
    }
  | {
      type: 'remove'
      id: string
    }
  | {
      type: 'update'
      id: string
      input: EntityInput<QuerySetDefinition>
    }
  | {
      type: 'duplicate'
      id: string
    }

const initList: AsyncRead<ListState> = async (get) => {
  const backend = get(BackendAtom.atom).QuerySetDefinition
  const result = await backend.getAll()
  if (result.success) {
    return { items: result.value }
  } else {
    return { items: [], error: result.error }
  }
}

const create: AsyncHandler<ListState, ListAction> = async (curr, get, set, action) => {
  if (action.type === 'create') {
    const backend = get(BackendAtom.atom).QuerySetDefinition
    const result = await backend.create()
    if (result.success) {
      set(selectionAtom, result.value.id)
      set(selectableAtom, false)
      return {
        items: [...curr.items, result.value].toSorted((a, b) => a.name.localeCompare(b.name))
      }
    } else {
      console.warn(result.error)
      return { ...curr, error: result.error }
    }
  }
  return curr
}

const update: AsyncHandler<ListState, ListAction> = async (curr, get, _set, action) => {
  if (action.type === 'update') {
    const svc = get(BackendAtom.atom).QuerySetDefinition
    const { id, input } = action
    const result = await svc.update(id, input)
    if (result.success) {
      const nextState = {
        items: curr.items
          .map((item) => (item.id === id ? { ...item, ...input } : item))
          .toSorted((a, b) => a.name.localeCompare(b.name))
      }
      return nextState
    } else {
      console.warn(result.error)
      return { ...curr, error: result.error }
    }
  }
  return curr
}

const remove: AsyncHandler<ListState, ListAction> = async (curr, get, set, action) => {
  if (action.type === 'remove') {
    const backend = get(BackendAtom.atom).QuerySetDefinition
    const { id } = action
    const result = await backend.remove(id)
    if (result.success) {
      const selectedId = get(selectionAtom)
      const items = curr.items.filter((i) => i.id !== id)
      if (selectedId === id) {
        if (items.length >= 0) {
          set(selectionAtom, items[0].id)
        }
        set(selectableAtom, true)
      }
      return { items }
    } else {
      console.warn(result.error)
      return { ...curr, error: result.error }
    }
  }
  return curr
}

const duplicate: AsyncHandler<ListState, ListAction> = async (curr, get, set, action) => {
  if (action.type === 'duplicate') {
    const backend = get(BackendAtom.atom).QuerySetDefinition
    const { id } = action
    const result = await backend.duplicate(id)
    if (result.success) {
      set(selectionAtom, result.value.id)
      set(selectableAtom, false)
      return {
        items: [...curr.items, result.value].toSorted((a, b) => a.name.localeCompare(b.name))
      }
    } else {
      console.warn(result.error)
      return { ...curr, error: result.error }
    }
  }
  return curr
}

const listAtom = JotaiUtil.asyncAtomWithAction(
  initList,
  JotaiUtil.composeAsyncHandlers({ create, update, remove, duplicate })
)

type ItemAction = {
  type: 'save'
  input: EntityInput<QuerySetDefinition>
}

const init: AsyncFamilyRead<string, QuerySetDefinition> = (id) => async (get) => {
  const messages = await get(QuerySetDefinitionAtom.listAtom)
  const item = messages.items.find((i) => i.id === id)
  if (!item) {
    throw new Error(`Item#${id} not found`)
  }
  return item
}

const save: AsyncFamilyHandler<string, QuerySetDefinition, ItemAction> =
  (id) => async (curr, _get, set, action) => {
    if (action.type === 'save') {
      const input = action.input
      await set(QuerySetDefinitionAtom.listAtom, {
        type: 'update',
        id,
        input
      })
      set(QuerySetDefinitionAtom.selectableAtom, true)
      return { ...curr, ...input }
    }
    return curr
  }

const mainAtom = JotaiUtil.asyncAtomFamilyWithAction(
  init,
  JotaiUtil.composeAsyncFamilyHandlers({ save })
)

const selectionAtom = atomWithStorage<string | null>('QuerySetDefinition.selectedId', null)

const selectableAtom = atom(true)

export const QuerySetDefinitionAtom = {
  listAtom,
  selectionAtom,
  selectableAtom,
  atom: mainAtom,
  Save: (input: EntityInput<QuerySetDefinition>): ItemAction => ({
    type: 'save',
    input
  }),
  Create: (): ListAction => ({
    type: 'create'
  }),
  Remove: (id: string): ListAction => ({ type: 'remove', id }),
  Duplicate: (id: string): ListAction => ({ type: 'duplicate', id })
} as const
