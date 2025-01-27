import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { EntityInput, SqsMessageDefinition } from '../../../../common/interface'
import { BackendAtom } from '../../ipc/BackendAtom'
import { AsyncHandler, AsyncRead, JotaiUtil } from '../../util/JotaiUtil'

type ListState = {
  items: ReadonlyArray<SqsMessageDefinition>
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
      data: EntityInput<SqsMessageDefinition>
    }

const initList: AsyncRead<ListState> = async (get) => {
  const svc = get(BackendAtom.atom).SqsMessageDefinition
  const result = await svc.getAll()
  if (result.success) {
    return { items: result.value }
  } else {
    return { items: [], error: result.error }
  }
}

const comparator = (a: SqsMessageDefinition, b: SqsMessageDefinition): number =>
  a.name.localeCompare(b.name)

const create: AsyncHandler<ListState, ListAction> = async (curr, get, set, action) => {
  if (action.type === 'create') {
    const svc = get(BackendAtom.atom).SqsMessageDefinition
    const result = await svc.create()
    if (result.success) {
      const created = result.value
      set(selectionAtom, created.id)
      set(selectableAtom, false)
      return { items: [...curr.items, created].toSorted(comparator) }
    } else {
      console.warn(result.error)
      return { ...curr, error: result.error }
    }
  }
  return curr
}

const update: AsyncHandler<ListState, ListAction> = async (curr, get, set, action) => {
  if (action.type === 'update') {
    const svc = get(BackendAtom.atom).SqsMessageDefinition
    const { id, data } = action
    await svc.update(id, data)
    const selectedId = get(selectionAtom)
    if (selectedId === id) {
      set(selectableAtom, true)
    }
    return {
      items: curr.items.map((i) => (i.id === id ? { ...i, ...data } : i)).toSorted(comparator)
    }
  }
  return curr
}

const remove: AsyncHandler<ListState, ListAction> = async (curr, get, set, action) => {
  if (action.type === 'remove') {
    const svc = get(BackendAtom.atom).SqsMessageDefinition
    const { id } = action
    const result = await svc.remove(id)
    if (!result.success) {
      console.warn(result.error)
      return { ...curr, error: result.error }
    }
    const items = curr.items.filter((i) => i.id !== id)
    const selectedId = get(selectionAtom)
    if (selectedId === id) {
      set(selectableAtom, true)
      set(selectionAtom, items.length > 0 ? items[0].id : null)
    }
    return { items }
  }
  return curr
}

const listAtom = JotaiUtil.asyncAtomWithAction(
  initList,
  JotaiUtil.composeAsyncHandlers({ create, update, remove })
)

const selectionAtom = atomWithStorage<string | null>('SqsMessageDefinition.selectedId', null)

type SelectionAction = {
  type: 'select'
  id: string | null
}

const selectableAtom = atom(true)

export const SqsMessageDefinitionListAtom = {
  atom: listAtom,
  selectionAtom,
  selectableAtom,
  Create: (): ListAction => ({
    type: 'create'
  }),
  Update: (id: string, data: EntityInput<SqsMessageDefinition>): ListAction => ({
    type: 'update',
    id,
    data
  }),
  Remove: (id: string): ListAction => ({ type: 'remove', id }),
  Select: (id: string | null): SelectionAction => ({ type: 'select', id })
} as const
