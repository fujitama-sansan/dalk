import { notImpl } from '../util/Nop'
import { Result } from '../util/Result'
import { Entity, EntityInput } from './Entity'

export type QueryItem = Readonly<{
  id: string
  query: string
  targetParameter: string
}>

export type QuerySetDefinition = Entity &
  Readonly<{
    name: string
    description: string
    threshold: number
    maxCount: number
    queries: ReadonlyArray<QueryItem>
    ucompanyIds: string
  }>

const collectParameterNames = (query: string): ReadonlySet<string> => {
  const matches = query.match(/@[a-zA-Z_]\w*/g)
  if (matches) {
    return new Set(matches.map((m) => m.substring(1)))
  }
  return new Set()
}

export const QuerySetDefinitionUtil = {
  collectParameterNames
} as const

export type QueryExecutionInput = Readonly<{
  ucompanyIds: string
  queries: ReadonlyArray<QueryItem>
}>

export interface QuerySetDefinitionService {
  getAll(): Promise<Result<ReadonlyArray<QuerySetDefinition>>>
  create(): Promise<Result<QuerySetDefinition>>
  update(id: string, def: EntityInput<QuerySetDefinition>): Promise<Result<void>>
  remove(id: string): Promise<Result<void>>
  duplicate(id: string): Promise<Result<QuerySetDefinition>>
}

export const fakeQuerySetDefinitionService: QuerySetDefinitionService = {
  getAll: notImpl,
  create: notImpl,
  update: notImpl,
  remove: notImpl,
  duplicate: notImpl
}

export interface QuerySetExecutionService {
  execute(dbSettingId: string, input: QueryExecutionInput): Promise<Result<string>>
  stop(executionId: string): Promise<Result<void>>
}

export const fakeQuerySetExecutionService: QuerySetExecutionService = {
  execute: notImpl,
  stop: notImpl
}
