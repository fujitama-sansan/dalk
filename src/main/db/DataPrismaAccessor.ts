import { PrismaClient } from '.prisma/client/data'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { DbSetting } from '../../common/interface'
import { LocalPrismaAccessor } from '../localDb/LocalPrismaAccessor'
import { PostgresUtil, PrismaConnectionOptions } from './PostgresUtil'

export type DataPrismaClient = PrismaClient

// dataClients[dbSetting.id][shardNum] に PrismaClient をキャッシュする
const dataClients: Record<string, Record<number, DataPrismaClient>> = {}

const makeStagingHostname = (shardNum: number): string => {
  return `data-${String(shardNum).padStart(3, '0')}.master.staging.sansan.com`
}

const makeStagingPort = (shardNum: number): number => {
  return 20000 + shardNum
}

const makeDevDbName = (shardNum: number): string => {
  return `lkweb_data${shardNum}`
}

const connectByShardNum = (dbSetting: DbSetting, shardNum: number): DataPrismaClient => {
  if (dataClients[dbSetting.id] === undefined) {
    dataClients[dbSetting.id] = {}
  }
  if (dataClients[dbSetting.id][shardNum] === undefined) {
    const connectionOptions = {
      host: dbSetting.staging ? makeStagingHostname(shardNum) : dbSetting.host,
      port: dbSetting.staging ? makeStagingPort(shardNum) : dbSetting.port,
      database: dbSetting.staging ? 'lkweb' : makeDevDbName(shardNum),
      user: dbSetting.user,
      password: dbSetting.password,
      options: {
        schema: 'lkweb',
        connect_timeout: 3,
        statement_timeout: 30000
      }
    } satisfies PrismaConnectionOptions
    const pool = new Pool({
      connectionString: PostgresUtil.buildPostgresConnectionString(connectionOptions),
      max: 3
    })
    const adapter = new PrismaPg(pool, { schema: 'lkweb' })
    dataClients[dbSetting.id][shardNum] = new PrismaClient({
      adapter,
      log: ['warn', 'error']
    })
  }
  return dataClients[dbSetting.id][shardNum]
}

const shardNumList = (staging: boolean): ReadonlyArray<number> =>
  staging ? new Array(11).fill(0).map((_, i) => i + 1) : [1, 2]

const connectByUcompanyId = async (
  dbSetting: DbSetting,
  ucompanyId: string
): Promise<DataPrismaClient> => {
  let shardNum = await getShardNum(dbSetting.id, ucompanyId)
  if (!shardNum) {
    for (const num of shardNumList(dbSetting.staging)) {
      const client = connectByShardNum(dbSetting, num)
      const count = await client.mst_ucompany.count({
        where: {
          ucompany_id: ucompanyId,
          delete_flag: '00000000'
        }
      })
      if (count > 0) {
        await setUcompanyShard(dbSetting.id, ucompanyId, num)
        shardNum = num
        break
      }
    }
  }
  if (!shardNum) {
    throw new Error(`No shard found for ${ucompanyId}`)
  }
  return connectByShardNum(dbSetting, shardNum)
}

const makeUcompanyIdsQuery = (expr: string | undefined): string => {
  if (expr) {
    if (expr?.match(/\bselect[\s\r\n\t]/i)) {
      return expr
    } else {
      const ids = expr.split(/[\s,]+/).filter((id) => id.match(/^[\w\-.]+$/))
      if (ids.length > 0) {
        return `SELECT ucompany_id
            FROM lkweb.mst_ucompany
            WHERE ucompany_id IN (${ids.map((id) => `'${id}'`).join(',')})
            AND delete_flag = 0::bit(8)
            AND effective_date_from < now()
            AND effective_date_to > now()`
      }
    }
  }
  return `SELECT ucompany_id 
        FROM lkweb.mst_ucompany
        WHERE delete_flag = 0::bit(8)
        AND effective_date_from < now()
        AND effective_date_to > now()`
}

/**
 * @param ucompanyIdsExpr SELECT文、もしくはucomapnyIdをスペース区切りした文字列
 */
const getAvailableUcompanyIds = async (
  dbSetting: DbSetting,
  ucompanyIdsExpr?: string
): Promise<ReadonlyArray<string>> => {
  const searchQuery = makeUcompanyIdsQuery(ucompanyIdsExpr)
  const ret: string[] = []
  for (const num of shardNumList(dbSetting.staging)) {
    const client = connectByShardNum(dbSetting, num)
    const result = await client.$queryRawUnsafe<{ ucompany_id: string }[]>(searchQuery)
    if (result.length > 0) {
      for (const r of result) {
        ret.push(r.ucompany_id)
        await setUcompanyShard(dbSetting.id, r.ucompany_id, num)
      }
    }
  }
  return ret
}

const getShardNum = async (dbSettingId: string, ucompanyId: string): Promise<number | null> => {
  const prisma = LocalPrismaAccessor.connect()
  const shard = await prisma.ucompanyShard.findUnique({
    where: {
      dbSettingId_ucompanyId: {
        dbSettingId,
        ucompanyId
      }
    }
  })
  return shard?.shardNum ?? null
}

const setUcompanyShard = async (
  dbSettingId: string,
  ucompanyId: string,
  shardNum: number
): Promise<void> => {
  const prisma = LocalPrismaAccessor.connect()
  const shard = await prisma.ucompanyShard.findUnique({
    where: {
      dbSettingId_ucompanyId: {
        dbSettingId,
        ucompanyId
      }
    }
  })
  if (!shard) {
    await prisma.ucompanyShard.create({
      data: {
        dbSettingId,
        ucompanyId,
        shardNum
      }
    })
  }
}

export const DataPrismaAccessor = {
  connectByShardNum,
  connectByUcompanyId,
  getAvailableUcompanyIds
} as const
