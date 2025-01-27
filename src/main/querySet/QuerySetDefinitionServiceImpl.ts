import { EntityInput, QuerySetDefinition, QuerySetDefinitionService } from '../../common/interface'
import { Result, resultify } from '../../common/util/Result'
import { LocalPrismaAccessor } from '../localDb/LocalPrismaAccessor'
import { IdGenerator } from '../util/IdGenerator'

export class QuerySetDefinitionServiceImpl implements QuerySetDefinitionService {
  constructor(private readonly idGenerator: IdGenerator) {}

  getAll(): Promise<Result<ReadonlyArray<QuerySetDefinition>>> {
    return resultify(async () => {
      const prisma = LocalPrismaAccessor.connect()
      return (
        await prisma.querySetDefinition.findMany({
          include: {
            queries: {
              orderBy: {
                listOrder: 'asc'
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        })
      ).map(toQuerySetDefinition)
    })
  }

  create(): Promise<Result<QuerySetDefinition>> {
    return resultify(async () => {
      const prisma = LocalPrismaAccessor.connect()
      const record = await prisma.querySetDefinition.create({
        data: {
          id: this.idGenerator.generate(),
          name: '',
          description: '',
          ucompanyIds: '',
          threshold: 0,
          maxCount: 100
        }
      })
      // 空のqueryを作成
      const firstQuery = await prisma.queryItem.create({
        data: {
          id: this.idGenerator.generate(),
          query: '',
          targetParameter: '',
          querySetDefinitionId: record.id,
          listOrder: 0
        }
      })
      return toQuerySetDefinition({ ...record, queries: [firstQuery] })
    })
  }

  update(id: string, def: EntityInput<QuerySetDefinition>): Promise<Result<void>> {
    return resultify(async () => {
      const prisma = LocalPrismaAccessor.connect()
      if (def.queries) {
        const updatedIds: string[] = []
        for (let i = 0; i < def.queries.length; i++) {
          const query = def.queries[i]
          if (query.id) {
            await prisma.queryItem.update({
              where: {
                id: query.id
              },
              data: {
                query: query.query,
                targetParameter: query.targetParameter,
                listOrder: i
              }
            })
            updatedIds.push(query.id)
          } else {
            const created = await prisma.queryItem.create({
              data: {
                id: this.idGenerator.generate(),
                query: query.query,
                targetParameter: query.targetParameter,
                querySetDefinitionId: id,
                listOrder: i
              }
            })
            updatedIds.push(created.id)
          }
        }
        await prisma.queryItem.deleteMany({
          where: {
            querySetDefinitionId: id,
            NOT: {
              id: {
                in: updatedIds
              }
            }
          }
        })
      }
      await prisma.querySetDefinition.update({
        where: {
          id
        },
        data: {
          name: def.name,
          description: def.description,
          threshold: def.threshold,
          ucompanyIds: def.ucompanyIds
        }
      })
    })
  }

  remove(id: string): Promise<Result<void>> {
    return resultify(async () => {
      const prisma = LocalPrismaAccessor.connect()
      await prisma.queryItem.deleteMany({
        where: {
          querySetDefinitionId: id
        }
      })
      await prisma.querySetDefinition.delete({
        where: {
          id
        }
      })
    })
  }

  duplicate(id: string): Promise<Result<QuerySetDefinition>> {
    return resultify(async () => {
      const prisma = LocalPrismaAccessor.connect()
      const record = await prisma.querySetDefinition.findUnique({
        where: {
          id
        },
        include: {
          queries: {
            orderBy: {
              listOrder: 'asc'
            }
          }
        }
      })
      if (!record) {
        throw new Error('Not found')
      }
      const newRecord = await prisma.querySetDefinition.create({
        data: {
          id: this.idGenerator.generate(),
          name: record.name + ' (copy)',
          description: record.description,
          threshold: record.threshold,
          maxCount: record.maxCount,
          ucompanyIds: record.ucompanyIds
        }
      })
      const queries = await Promise.all(
        record.queries.map((q) =>
          prisma.queryItem.create({
            data: {
              id: this.idGenerator.generate(),
              query: q.query,
              targetParameter: q.targetParameter,
              querySetDefinitionId: newRecord.id,
              listOrder: q.listOrder
            }
          })
        )
      )
      queries.sort((a, b) => a.listOrder - b.listOrder)
      return toQuerySetDefinition({ ...newRecord, queries })
    })
  }
}

type QueryItemRecord = Readonly<{
  id: string
  query: string
  targetParameter: string
  querySetDefinitionId: string
}>

type QuerySetDefinitionRecord = Readonly<{
  id: string
  name: string
  description: string
  threshold: number
  maxCount: number
  ucompanyIds: string
  queries: ReadonlyArray<QueryItemRecord>
}>

const toQuerySetDefinition = (record: QuerySetDefinitionRecord): QuerySetDefinition => ({
  id: record.id,
  name: record.name,
  description: record.description,
  threshold: record.threshold,
  maxCount: record.maxCount,
  queries: record.queries.map((q) => ({
    id: q.id,
    query: q.query,
    targetParameter: q.targetParameter
  })),
  ucompanyIds: record.ucompanyIds
})
