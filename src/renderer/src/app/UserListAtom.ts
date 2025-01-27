import { User, UserService } from '../../../common/interface'
import { BackendAtom } from '../ipc/BackendAtom'
import { AsyncHandler, AsyncRead, JotaiUtil } from '../util/JotaiUtil'
import { AppSetting, AppSettingAtom, UcompanySetSetting } from './AppSettingAtom'

type UserList = {
  query: string
  users: ReadonlyArray<User>
}

type UserListAction = {
  type: 'search'
  query: string
}

type ReadyData = UcompanySetSetting['data']

const isReady = (setting: AppSetting): setting is UcompanySetSetting =>
  setting.state === 'Complete' || setting.state === 'UcompanySet'

const doSearch = async (
  userService: UserService,
  data: ReadyData,
  query: string
): Promise<ReadonlyArray<User>> => {
  const usersR = await userService.search(data.dbSettingId, data.ucompanyId, { query })
  if (usersR.success) {
    return usersR.value
  } else {
    throw new Error(usersR.error)
  }
}

const init: AsyncRead<UserList> = async (get) => {
  const query = ''
  const appSetting = await get(AppSettingAtom.atom)
  if (!isReady(appSetting)) {
    return { users: [], query }
  }
  const userService = get(BackendAtom.atom).User
  const users = await doSearch(userService, appSetting.data, query)
  return { users, query }
}

const search: AsyncHandler<UserList, UserListAction> = async (curr, get, _set, action) => {
  if (action.type === 'search') {
    const { query } = action
    if (query !== curr.query) {
      const appSetting = await get(AppSettingAtom.atom)
      if (!isReady(appSetting)) {
        return { users: [], query }
      }
      const userService = get(BackendAtom.atom).User
      const users = await doSearch(userService, appSetting.data, query)
      return { users, query }
    }
  }
  return curr
}

const mainAtom = JotaiUtil.asyncAtomWithAction(init, JotaiUtil.composeAsyncHandlers({ search }))

export const UserListAtom = {
  atom: mainAtom,
  Search: (query: string): UserListAction => ({
    type: 'search',
    query
  })
}
