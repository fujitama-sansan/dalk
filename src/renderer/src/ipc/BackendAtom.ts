import { atom } from 'jotai'

import {
  Backend,
  BackendEventApi,
  fakeBackend,
  fakeBackendEventApi
} from '../../../common/interface'

const mainAtom = atom<Backend>(fakeBackend)

const eventApiAtom = atom<BackendEventApi>(fakeBackendEventApi)

export const BackendAtom = {
  atom: mainAtom,
  eventApiAtom
} as const
