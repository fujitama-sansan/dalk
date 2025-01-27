import { OffsetLimit } from '../../../common/interface'

export type PagenationModel = Readonly<{
  pageSize: number
  page: number
}>

const calcOffsetLimit = (
  currentDataCount: number,
  pagenationModel: PagenationModel
): OffsetLimit => {
  const neededDataCount = pagenationModel.pageSize * (pagenationModel.page + 1)
  if (currentDataCount >= neededDataCount) {
    return {
      offset: 0,
      limit: 0
    }
  } else {
    return {
      offset: currentDataCount,
      limit: neededDataCount - currentDataCount
    }
  }
}

export const DataListUtil = {
  calcOffsetLimit
}
