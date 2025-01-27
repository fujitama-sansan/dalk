import { notImpl } from '../util/Nop'
import { Result } from '../util/Result'

export type Ucompany = Readonly<{
  ucompanyId: string
  ucompanyName: string
}>

export interface UcompanyService {
  get: (dbSettingId: string, companyId: string) => Promise<Result<Ucompany>>
}

export const fakeUcompanyService = {
  get: notImpl
}
