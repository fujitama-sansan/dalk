import {
  DbSetting,
  DbSettingService,
  DbSettingUpdateInput,
  emptyDbSetting
} from '../../common/interface'
import { Result, resultify } from '../../common/util/Result'
import { LocalPrisma, LocalPrismaAccessor } from '../localDb/LocalPrismaAccessor'
import { IdGenerator } from '../util/IdGenerator'
import { DbSettingRepository } from './DbSettingRepository'

const toDbSetting = DbSettingRepository.toDbSetting

export class DbSettingServiceImpl implements DbSettingService {
  constructor(private readonly idGenerator: IdGenerator) {}

  getAll(): Promise<Result<ReadonlyArray<DbSetting>>> {
    return resultify(async () => {
      const prisma = LocalPrismaAccessor.connect()
      const all = (await prisma.dbSetting.findMany()).map(toDbSetting)
      if (all.length === 0) {
        const first = await prisma.dbSetting.create({
          data: toCreateInput(emptyDbSetting, this.idGenerator)
        })
        all.push(toDbSetting(first))
      }
      return all
    })
  }

  create(): Promise<Result<DbSetting>> {
    return resultify(async () => {
      const prisma = LocalPrismaAccessor.connect()
      const record = await prisma.dbSetting.create({
        data: toCreateInput(emptyDbSetting, this.idGenerator)
      })
      return toDbSetting(record)
    })
  }

  update(id: string, setting: DbSettingUpdateInput): Promise<Result<void>> {
    return resultify(async () => {
      const prisma = LocalPrismaAccessor.connect()
      await prisma.dbSetting.update({
        where: {
          id
        },
        data: toUpdateInput(setting)
      })
    })
  }

  remove(id: string): Promise<Result<void>> {
    return resultify(async () => {
      const prisma = LocalPrismaAccessor.connect()
      await prisma.dbSetting.delete({
        where: {
          id
        }
      })
    })
  }
}

const forceNumber = (value: number | string | null): number | null => {
  if (value === null) {
    return null
  }
  return typeof value === 'string' ? parseInt(value) : value
}

const toUpdateInput = (input: DbSettingUpdateInput): LocalPrisma.DbSettingUpdateInput => {
  return {
    name: input.name,
    host: input.staging ? null : input.host,
    port: input.staging ? null : forceNumber(input.port),
    user: input.user,
    password: input.password,
    staging: input.staging
  }
}

const toCreateInput = (
  setting: DbSetting,
  idGenerator: IdGenerator
): LocalPrisma.DbSettingCreateInput => ({
  id: idGenerator.generate(),
  name: setting.name,
  host: setting.staging ? null : setting.host,
  port: setting.staging ? null : setting.port,
  user: setting.user,
  password: setting.password,
  staging: setting.staging
})
