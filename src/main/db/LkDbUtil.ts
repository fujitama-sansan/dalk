import { User } from '../../common/interface'

export type PartialDataForUpdate = {
  udtucompany: string
  udtuser: string
  udttimestamp: Date
}

export type PartialDataForCreate = {
  crtucompany: string
  crtuser: string
  crttimestamp: Date
} & PartialDataForUpdate

const makePartialDataForUpdate = (operatorUser: User, now?: Date): PartialDataForUpdate => {
  const timestamp = now || new Date()
  return {
    udttimestamp: timestamp,
    udtucompany: operatorUser.ucompanyId,
    udtuser: operatorUser.userId
  }
}

const makePartialDataForCreate = (operatorUser: User, now?: Date): PartialDataForCreate => {
  const timestamp = now || new Date()
  return {
    ...makePartialDataForUpdate(operatorUser, timestamp),
    crttimestamp: timestamp,
    crtucompany: operatorUser.ucompanyId,
    crtuser: operatorUser.userId
  }
}

export const LkDbUtil = {
  makePartialDataForCreate,
  makePartialDataForUpdate
}
