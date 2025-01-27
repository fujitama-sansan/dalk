import {
  EntityInput,
  SqsMessageDefinition,
  SqsMessageDefinitionService
} from '../../common/interface'
import { Result, resultify } from '../../common/util/Result'
import { LocalPrisma, LocalPrismaAccessor } from '../localDb/LocalPrismaAccessor'
import { IdGenerator } from '../util/IdGenerator'

export class SqsMessageDefinitionServiceImpl implements SqsMessageDefinitionService {
  constructor(private readonly idGenerator: IdGenerator) {}

  getAll(): Promise<Result<ReadonlyArray<SqsMessageDefinition>>> {
    return resultify(async () => {
      const prisma = LocalPrismaAccessor.connect()

      return (
        await prisma.sqsMessageDefinition.findMany({
          orderBy: {
            name: 'asc'
          }
        })
      ).map(toSqsMessageDefinition)
    })
  }

  create(): Promise<Result<SqsMessageDefinition>> {
    return resultify(async () => {
      const prisma = LocalPrismaAccessor.connect()
      const created = await prisma.sqsMessageDefinition.create({
        data: toCreateInput({
          id: this.idGenerator.generate(),
          name: '',
          queue: null,
          messageClass: '',
          correlationId: '',
          graph: ''
        })
      })
      return toSqsMessageDefinition(created)
    })
  }

  update(id: string, input: EntityInput<SqsMessageDefinition>): Promise<Result<void>> {
    return resultify(async () => {
      const prisma = LocalPrismaAccessor.connect()
      await prisma.sqsMessageDefinition.update({
        where: {
          id
        },
        data: toUpdateInput(input)
      })
    })
  }

  remove(id: string): Promise<Result<void>> {
    return resultify(async () => {
      const prisma = LocalPrismaAccessor.connect()
      await prisma.sqsMessageDefinition.delete({
        where: {
          id
        }
      })
    })
  }
}

const toCreateInput = (def: SqsMessageDefinition): LocalPrisma.SqsMessageDefinitionCreateInput => ({
  id: def.id,
  name: def.name,
  queueUrl: def.queue?.url || '',
  queueName: def.queue?.name || '',
  messageClass: def.messageClass,
  correlationId: def.correlationId,
  graph: def.graph
})

const toUpdateInput = (
  input: EntityInput<SqsMessageDefinition>
): LocalPrisma.SqsMessageDefinitionUpdateInput => ({
  name: input.name,
  queueUrl: input.queue?.url,
  queueName: input.queue?.name,
  messageClass: input.messageClass,
  correlationId: input.correlationId,
  graph: input.graph
})

type SqsMessageDefinitionRecord = {
  id: string
  name: string
  queueUrl: string
  queueName: string
  messageClass: string
  correlationId: string
  graph: string
}

const toSqsMessageDefinition = (record: SqsMessageDefinitionRecord): SqsMessageDefinition => ({
  id: record.id,
  name: record.name,
  queue: {
    url: record.queueUrl,
    name: record.queueName
  },
  messageClass: record.messageClass,
  correlationId: record.correlationId,
  graph: record.graph
})
