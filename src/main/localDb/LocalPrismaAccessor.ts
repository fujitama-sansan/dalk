import { PrismaClient } from '.prisma/client/local'
import { FileUtil } from '../util/FileUtil'
export type { Prisma as LocalPrisma } from '.prisma/client/local'

let connection: PrismaClient | null = null

export type LocalPrismaClient = PrismaClient

const datasourceUrl = FileUtil.dalkUrl('sqlite.db')

const connect = (): LocalPrismaClient => {
  if (!connection) {
    console.log('create new connection')
    connection = new PrismaClient({
      datasourceUrl
    })
  }
  return connection
}

export const LocalPrismaAccessor = {
  connect,
  datasourceUrl
} as const
