import { mst_ucompany } from '.prisma/client/data'
import { Ucompany, UcompanyService } from '../../common/interface'
import { Result, resultify } from '../../common/util/Result'
import { DataPrismaAccessor } from '../db/DataPrismaAccessor'
import { DbSettingRepository } from '../db/DbSettingRepository'

export class UcompanyServiceImpl implements UcompanyService {
  constructor(readonly dbSettingRepository: DbSettingRepository) {}

  get(dbSettingId: string, ucompanyId: string): Promise<Result<Ucompany>> {
    return resultify(async () => {
      const dbSetting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
      const record = await prisma.mst_ucompany.findFirst({
        where: {
          ucompany_id: ucompanyId
        }
      })
      if (!record) {
        throw new Error('UCompany not found')
      }
      return toUCompany(record)
    })
  }
}

const toUCompany = (record: mst_ucompany): Ucompany => {
  return {
    ucompanyId: record.ucompany_id,
    ucompanyName: record.ucompany_name
  }
}
