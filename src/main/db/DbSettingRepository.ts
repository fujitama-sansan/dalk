import { DbSetting } from '../../common/interface'
import { LocalPrismaAccessor } from '../localDb/LocalPrismaAccessor'

export type DbSettingRepository = {
  getOrThrow: (id: string) => Promise<DbSetting>
}

type DbSettingRecord = {
  id: string
  name: string
  host: string | null
  port: number | null
  user: string
  password: string
  staging: boolean
}

const toDbSetting = (record: DbSettingRecord): DbSetting => {
  const base = {
    id: record.id,
    name: record.name,
    user: record.user,
    password: record.password
  }
  return {
    ...base,
    ...(record.staging
      ? {
          staging: true
        }
      : {
          host: record.host || '',
          port: record.port || 0,
          staging: false
        })
  }
}

export const DbSettingRepository = {
  create: (): DbSettingRepository => ({
    getOrThrow: async (id: string): Promise<DbSetting> => {
      const prisma = LocalPrismaAccessor.connect()
      const record = await prisma.dbSetting.findUnique({
        where: {
          id
        }
      })
      if (!record) {
        throw new Error(`DbSetting ${id} not found`)
      }
      return toDbSetting(record)
    }
  }),
  toDbSetting
}
