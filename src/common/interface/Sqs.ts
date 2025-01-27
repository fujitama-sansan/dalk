import { notImpl } from '../util/Nop'
import { Result } from '../util/Result'
import { Entity, EntityInput } from './Entity'

export type SqsQueue = Readonly<{
  name: string
  url: string
}>

export interface SqsQueueService {
  listQueues(prefix: string): Promise<Result<ReadonlyArray<SqsQueue>>>
  send(queue: SqsQueue, message: string): Promise<Result<void>>
}

export const fakeSqsQueueService: SqsQueueService = {
  listQueues: notImpl,
  send: notImpl
} as const

export type SqsMessageDefinition = Entity &
  Readonly<{
    name: string
    queue: SqsQueue | null
    messageClass: string
    correlationId: string
    graph: string
  }>

export interface SqsMessageDefinitionService {
  getAll(): Promise<Result<ReadonlyArray<SqsMessageDefinition>>>
  create(): Promise<Result<SqsMessageDefinition>>
  update(id: string, input: EntityInput<SqsMessageDefinition>): Promise<Result<void>>
  remove(id: string): Promise<Result<void>>
}

export const fakeSqsMesssageDefinitionService: SqsMessageDefinitionService = {
  getAll: notImpl,
  create: notImpl,
  update: notImpl,
  remove: notImpl
} as const
