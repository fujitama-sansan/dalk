import {
  BizCard,
  BizCardRegisterChannel,
  BizCardSearchQuery,
  BizCardSearchQueryWithOffsetLimit,
  BizCardService
} from '../../../../common/interface'
import { Result, forResult } from '../../../../common/util/Result'
import { AppSetting, AppSettingAtom } from '../../app/AppSettingAtom'
import { BackendAtom } from '../../ipc/BackendAtom'
import { DataListUtil, PagenationModel } from '../../util/DataListUtil'
import { AsyncHandler, AsyncRead, JotaiUtil } from '../../util/JotaiUtil'

type BizCardListAction =
  | {
      type: 'makeUnread'
      bizCardIds: readonly string[]
    }
  | {
      type: 'makeNayosed'
      bizCardIds: readonly string[]
    }
  | {
      type: 'search'
      searchQuery: BizCardSearchQuery
    }
  | {
      type: 'changePagenationModel'
      pagenationModel: PagenationModel
    }
  | {
      type: 'changeRegisterChannel'
      bizCardIds: readonly string[]
      registerChannel: BizCardRegisterChannel
    }

type BizCardList = {
  bizCards: ReadonlyArray<BizCard>
  totalCount: number
  searchQuery: BizCardSearchQuery
  pagenationModel: PagenationModel
}

const listBizCards = async (
  backend: BizCardService,
  settingData: {
    dbSettingId: string
    ucompanyId: string
    userId: string
  },
  searchQuery: BizCardSearchQueryWithOffsetLimit
): Promise<Result<[ReadonlyArray<BizCard>, number]>> =>
  forResult(
    () =>
      backend.getAll(
        settingData.dbSettingId,
        settingData.ucompanyId,
        settingData.userId,
        searchQuery
      ),
    () =>
      searchQuery.offset === 0
        ? backend.count(
            settingData.dbSettingId,
            settingData.ucompanyId,
            settingData.userId,
            searchQuery
          )
        : Promise.resolve({ success: true, value: 0 })
  )

const init: AsyncRead<BizCardList> = async (get) => {
  const searchQuery: BizCardSearchQuery = { query: '' }
  const pagenationModel: PagenationModel = { pageSize: 100, page: 0 }
  const backend = get(BackendAtom.atom).BizCard
  const appSetting = await get(AppSettingAtom.atom)
  if (appSetting.state !== 'Complete') {
    throw new Error('selectedUser is not set')
  }
  const offsetLimit = DataListUtil.calcOffsetLimit(0, pagenationModel)
  const listR = await listBizCards(backend, appSetting.data, { ...searchQuery, ...offsetLimit })
  if (listR.success) {
    const [bizCards, totalCount] = listR.value
    return {
      bizCards,
      totalCount,
      searchQuery,
      pagenationModel
    }
  } else {
    console.warn(listR.error)
  }

  return {
    bizCards: [],
    totalCount: 0,
    searchQuery,
    pagenationModel
  }
}

const search: AsyncHandler<BizCardList, BizCardListAction> = async (curr, get, _set, action) => {
  if (action.type !== 'search') return curr

  const searchQuery = action.searchQuery
  const pagenationModel: PagenationModel = { pageSize: curr.pagenationModel.pageSize, page: 0 }
  const offsetLimit = DataListUtil.calcOffsetLimit(0, pagenationModel)
  const backend = get(BackendAtom.atom).BizCard
  const appSetting = await get(AppSettingAtom.atom)
  if (appSetting.state !== 'Complete') {
    throw new Error('selectedUser is not set')
  }

  const listR = await listBizCards(backend, appSetting.data, {
    ...searchQuery,
    ...offsetLimit
  })
  if (listR.success) {
    const [bizCards, totalCount] = listR.value
    return {
      bizCards,
      totalCount,
      searchQuery,
      pagenationModel
    }
  } else {
    console.warn(listR.error)
  }
  return {
    bizCards: [],
    totalCount: 0,
    searchQuery,
    pagenationModel
  }
}

const updateBizCards = async (
  curr: BizCardList,
  backend: BizCardService,
  appSetting: AppSetting,
  bizCardIds: readonly string[],
  input: Partial<BizCard>
): Promise<BizCardList> => {
  if (appSetting.state !== 'Complete') {
    throw new Error('selectedUser is not set')
  }
  const { data } = appSetting
  const result = await backend.update(
    data.dbSettingId,
    data.ucompanyId,
    bizCardIds,
    input,
    appSetting.operatorUser
  )
  if (result.success) {
    const newBizCards = curr.bizCards.map((bizCard) => {
      if (bizCardIds.includes(bizCard.bizCardId)) {
        return {
          ...bizCard,
          ...input
        }
      } else {
        return bizCard
      }
    })
    return {
      ...curr,
      bizCards: newBizCards
    }
  }
  return curr
}

const makeUnread: AsyncHandler<BizCardList, BizCardListAction> = async (
  curr,
  get,
  _set,
  action
) => {
  if (action.type !== 'makeUnread') return curr
  const backend = get(BackendAtom.atom).BizCard
  const appSetting = await get(AppSettingAtom.atom)
  return updateBizCards(curr, backend, appSetting, action.bizCardIds, {
    entryStatus: '00101000'
  })
}

const makeNayosed: AsyncHandler<BizCardList, BizCardListAction> = async (
  curr,
  get,
  _set,
  action
) => {
  if (action.type !== 'makeNayosed') return curr
  const backend = get(BackendAtom.atom).BizCard
  const appSetting = await get(AppSettingAtom.atom)
  return updateBizCards(curr, backend, appSetting, action.bizCardIds, {
    identificationFlag: '00001111'
  })
}

const changeRegisterChannel: AsyncHandler<BizCardList, BizCardListAction> = async (
  curr,
  get,
  _set,
  action
) => {
  if (action.type !== 'changeRegisterChannel') return curr
  const backend = get(BackendAtom.atom).BizCard
  const appSetting = await get(AppSettingAtom.atom)
  return updateBizCards(curr, backend, appSetting, action.bizCardIds, {
    registerChannel: action.registerChannel
  })
}

const changePagenationModel: AsyncHandler<BizCardList, BizCardListAction> = async (
  curr,
  get,
  _set,
  action
) => {
  if (action.type !== 'changePagenationModel') return curr

  const backend = get(BackendAtom.atom).BizCard
  if (curr.totalCount === curr.bizCards.length) {
    return {
      ...curr,
      pagenationModel: action.pagenationModel
    }
  }
  const offsetLimit = DataListUtil.calcOffsetLimit(curr.bizCards.length, action.pagenationModel)
  if (offsetLimit.limit === 0) {
    return {
      ...curr,
      pagenationModel: action.pagenationModel
    }
  }
  const appSetting = await get(AppSettingAtom.atom)
  if (appSetting.state !== 'Complete') {
    throw new Error('selectedUser is not set')
  }

  const listR = await listBizCards(backend, appSetting.data, {
    ...curr.searchQuery,
    ...offsetLimit
  })
  if (listR.success) {
    const [bizCards, totalCount] = listR.value
    return {
      ...curr,
      bizCards: offsetLimit.offset === 0 ? bizCards : curr.bizCards.concat(bizCards),
      totalCount: offsetLimit.offset === 0 ? totalCount : curr.totalCount,
      pagenationModel: action.pagenationModel
    }
  } else {
    console.warn(listR.error)
  }

  return curr
}

const mainAtom = JotaiUtil.asyncAtomWithAction(
  init,
  JotaiUtil.composeAsyncHandlers({
    search,
    makeUnread,
    makeNayosed,
    changePagenationModel,
    changeRegisterChannel
  })
)

export const BizCardListAtom = {
  atom: mainAtom,
  Search: (searchQuery: BizCardSearchQuery): BizCardListAction => ({ type: 'search', searchQuery }),
  MakeUnread: (bizCardIds: readonly string[]): BizCardListAction => ({
    type: 'makeUnread',
    bizCardIds
  }),
  MakeNayosed: (bizCardIds: readonly string[]): BizCardListAction => ({
    type: 'makeNayosed',
    bizCardIds
  }),
  ChangePagenationModel: (pagenationModel: PagenationModel): BizCardListAction => ({
    type: 'changePagenationModel',
    pagenationModel
  }),
  ChangeRegisterChannel: (
    bizCardIds: readonly string[],
    registerChannel: BizCardRegisterChannel
  ): BizCardListAction => ({
    type: 'changeRegisterChannel',
    bizCardIds,
    registerChannel
  })
} as const
