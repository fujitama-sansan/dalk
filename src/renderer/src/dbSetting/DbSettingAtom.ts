import { atom } from 'jotai'
import { DbSetting, DbSettingUpdateInput } from '../../../common/interface'
import { Result } from '../../../common/util/Result'
import { BackendAtom } from '../ipc/BackendAtom'
import { AsyncFamilyHandler, AsyncHandler, AsyncRead, JotaiUtil } from '../util/JotaiUtil'

export type DbSettingList = Readonly<{
  items: ReadonlyArray<DbSetting>
}>

type DbSettingListAction = Readonly<
  | {
      type: 'create'
      onCreated: (newId: string) => void
    }
  | {
      type: 'updateList'
      id: string
      setting: DbSettingUpdateInput
    }
  | {
      type: 'remove'
      id: string
    }
>

type DbSettingListRead = AsyncRead<DbSettingList>
type DbSettingListHandler = AsyncHandler<DbSettingList, DbSettingListAction>

const right = <T>(result: Result<T>): T => {
  if (result.success) {
    return result.value
  } else {
    throw new Error(result.error)
  }
}

const init: DbSettingListRead = async (get) => {
  const backend = get(BackendAtom.atom).DbSetting
  const items = right(await backend.getAll())
  return {
    items
  }
}

const create: DbSettingListHandler = async (curr, get, _set, action) => {
  if (action.type === 'create') {
    const backend = get(BackendAtom.atom).DbSetting
    const created = right(await backend.create())
    action.onCreated(created.id)
    return {
      ...curr,
      items: [...curr.items, created]
    }
  } else {
    return curr
  }
}

const updateList: DbSettingListHandler = async (curr, get, _set, action) => {
  if (action.type === 'updateList') {
    const { id, setting } = action
    const existing = curr.items.find((item) => item.id === id)
    if (!existing) {
      throw new Error(`Item with id ${id} not found.`)
    }
    const backend = get(BackendAtom.atom).DbSetting
    await backend.update(id, setting)
    const updated = { ...setting, id } as DbSetting
    return {
      ...curr,
      items: curr.items.map((item) => (item.id === id ? updated : item))
    }
  } else {
    return curr
  }
}

const remove: DbSettingListHandler = async (curr, get, _set, action) => {
  if (action.type === 'remove') {
    const { id } = action
    const backend = get(BackendAtom.atom).DbSetting
    await backend.remove(id)
    return {
      ...curr,
      items: curr.items.filter((item) => item.id !== id)
    }
  } else {
    return curr
  }
}

const listAtom = JotaiUtil.asyncAtomWithAction(
  init,
  JotaiUtil.composeAsyncHandlers({
    create,
    updateList,
    remove
  })
)

type DbSettingItemAction = Readonly<{
  type: 'update'
  setting: DbSettingUpdateInput
}>

type DbSettingItemHandler = AsyncFamilyHandler<string, DbSetting, DbSettingItemAction>

const update: DbSettingItemHandler = (id) => async (curr, get, set, action) => {
  if (action.type === 'update') {
    await set(listAtom, { type: 'updateList', id, setting: action.setting })
    const updatedList = await get(listAtom)
    const updated = updatedList.items.find((item) => item.id === id)
    if (updated) {
      return updated
    }
  }
  return curr
}

const itemAtom = JotaiUtil.asyncAtomFamilyWithAction<string, DbSetting, DbSettingItemAction>(
  (id: string) =>
    async (get): Promise<DbSetting> => {
      const list = await get(listAtom)
      const item = list.items.find((item) => item.id === id)
      if (!item) {
        throw new Error(`Item with id ${id} not found.`)
      }
      return item
    },
  JotaiUtil.composeAsyncFamilyHandlers({ update })
)

const selectableAtom = atom(true)

export const DbSettingAtom = {
  listAtom,
  itemAtom,
  selectableAtom,
  Create: (onCreated?: (newId: string) => void): DbSettingListAction => ({
    type: 'create',
    onCreated: onCreated ?? ((): void => {})
  }),
  Remove: (id: string): DbSettingListAction => ({ type: 'remove', id }),
  Update: (setting: DbSettingUpdateInput): DbSettingItemAction => ({
    type: 'update',
    setting
  })
} as const
