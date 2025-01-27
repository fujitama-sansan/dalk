import { trn_nc } from '.prisma/client/data'
import type {
  BizCard,
  BizCardSearchQuery,
  BizCardSearchQueryWithOffsetLimit,
  BizCardService,
  BizCardUpdateInput,
  User
} from '../../common/interface'
import { Result, resultify } from '../../common/util/Result'
import { DataPrismaAccessor } from '../db/DataPrismaAccessor'
import { DbSettingRepository } from '../db/DbSettingRepository'
import { LkDbUtil } from '../db/LkDbUtil'

const toBizCard = (record: trn_nc): BizCard => ({
  bizCardId: record.mid_id,
  ucompanyId: record.ucompany_id,
  userId: record.user_id,
  registerChannel: record.register_channel,
  registerTimestamp: record.register_timestamp,
  entryStatus: record.entry_status,
  identificationFlag: record.identification_flag,
  stackId: record.stack_id,
  stackOrder: record.stack_order,
  updateTimestamp: record.update_timestamp,
  sansanCompanyCode: record.sansan_company_code,
  companyName: record.company_name,
  lastName: record.last_name,
  firstName: record.first_name,
  email: record.email,
  issueDate: record.issued_date,
  publishDate: record.publish_date,
  newsSourceType: record.news_source_type,
  newsSourceId: record.news_source_id
})

const toTrnNcPartial = (input: BizCardUpdateInput): Partial<trn_nc> => {
  const ret = {} as Partial<trn_nc>
  for (const key in input) {
    if (key === 'email') {
      ret.email = input.email
    } else if (key === 'companyName') {
      ret.company_name = input.companyName
    } else if (key === 'lastName') {
      ret.last_name = input.lastName
    } else if (key === 'firstName') {
      ret.first_name = input.firstName
    } else if (key === 'entryStatus') {
      ret.entry_status = input.entryStatus
    } else if (key === 'stackId') {
      ret.stack_id = input.stackId
    } else if (key === 'stackOrder') {
      ret.stack_order = input.stackOrder
    } else if (key === 'sansanCompanyCode') {
      ret.sansan_company_code = input.sansanCompanyCode
    } else if (key === 'identificationFlag') {
      ret.identification_flag = input.identificationFlag
    } else if (key === 'registerChannel') {
      ret.register_channel = input.registerChannel
    }
  }
  return ret
}

export class BizCardServiceImpl implements BizCardService {
  constructor(readonly dbSettingRepository: DbSettingRepository) {}

  getAll(
    dbSettingId: string,
    ucompanyId: string,
    userId: string,
    searchQuery: BizCardSearchQueryWithOffsetLimit
  ): Promise<Result<readonly BizCard[]>> {
    return resultify(async () => {
      const dbSetting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      const { query, offset, limit } = searchQuery
      const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
      const records = await prisma.trn_nc.findMany({
        where: {
          ucompany_id: ucompanyId,
          user_id: userId,
          OR: query
            ? [
                {
                  first_name: {
                    contains: query
                  }
                },
                {
                  last_name: {
                    contains: query
                  }
                },
                {
                  email: {
                    contains: query
                  }
                }
              ]
            : undefined
        },
        orderBy: {
          crttimestamp: 'desc'
        },
        take: limit,
        skip: offset
      })
      console.log({ records })
      return records.map(toBizCard)
    })
  }

  count(
    dbSettingId: string,
    ucompanyId: string,
    userId: string,
    searchQuery: BizCardSearchQuery
  ): Promise<Result<number>> {
    return resultify(async () => {
      const dbSetting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      const { query } = searchQuery
      const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
      return prisma.trn_nc.count({
        where: {
          ucompany_id: ucompanyId,
          user_id: userId,
          OR: query
            ? [
                {
                  first_name: {
                    contains: query
                  }
                },
                {
                  last_name: {
                    contains: query
                  }
                },
                {
                  email: {
                    contains: query
                  }
                }
              ]
            : undefined
        }
      })
    })
  }

  update(
    dbSettingId: string,
    ucompanyId: string,
    bizCardIds: readonly string[],
    input: BizCardUpdateInput,
    operatorUser: User
  ): Promise<Result<void>> {
    return resultify(async () => {
      const dbSetting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      const prisma = await DataPrismaAccessor.connectByUcompanyId(dbSetting, ucompanyId)
      await prisma.trn_nc.updateMany({
        data: {
          ...LkDbUtil.makePartialDataForUpdate(operatorUser),
          ...toTrnNcPartial(input)
        },
        where: {
          ucompany_id: ucompanyId,
          mid_id: {
            in: bizCardIds.slice()
          }
        }
      })
    })
  }
}
