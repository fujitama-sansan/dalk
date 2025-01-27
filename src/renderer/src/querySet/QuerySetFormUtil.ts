import {
  EntityInput,
  QueryExecutionInput,
  QueryItem,
  QuerySetDefinition,
  QuerySetDefinitionUtil
} from '../../../common/interface'

export type QueryItemFormData = Readonly<{
  id: string
  targetParameter: string
  query: string
}>

export type QuerySetFormData = Readonly<{
  name: string
  description: string
  threshold: number
  maxCount: number
  ucompanyIds: string
  queries: readonly QueryItemFormData[]
}>

const toQueryItemFormData = (query: QueryItem): QueryItemFormData => ({
  id: query.id,
  targetParameter: query.targetParameter,
  query: query.query
})

const toFormData = (querySet: QuerySetDefinition): QuerySetFormData => ({
  name: querySet.name,
  description: querySet.description,
  threshold: querySet.threshold,
  maxCount: querySet.maxCount,
  ucompanyIds: querySet.ucompanyIds,
  queries: querySet.queries.map(toQueryItemFormData)
})

const toQueryItem = (data: QueryItemFormData): QueryItem => ({
  id: data.id,
  targetParameter: data.targetParameter,
  query: data.query
})

const toInput = (data: QuerySetFormData): EntityInput<QuerySetDefinition> => ({
  name: data.name,
  description: data.description,
  threshold: data.threshold,
  maxCount: data.maxCount,
  ucompanyIds: data.ucompanyIds,
  queries: data.queries.map(toQueryItem)
})

const toExecutionInput = (data: QuerySetFormData): QueryExecutionInput => ({
  ucompanyIds: data.ucompanyIds,
  queries: data.queries.map(toQueryItem)
})

const collectAllParameterNames = (
  queries: ReadonlyArray<{ query: string }>
): ReadonlySet<string> => {
  const allParameters = new Set<string>()
  queries.forEach((q) =>
    QuerySetDefinitionUtil.collectParameterNames(q.query).forEach((p) => allParameters.add(p))
  )
  return allParameters
}

type ArrangeParams = {
  queries: readonly QueryItem[]
  append: (targetParameters: QueryItem[]) => void
  remove: (indice: number[]) => void
}

const diff = <T>(a: ReadonlySet<T>, b: ReadonlySet<T>): Array<T> => {
  return Array.from(a).filter((x) => !b.has(x))
}

const arrange = ({ queries, append, remove }: ArrangeParams): void => {
  const existingNames = new Set(queries.map((q) => q.targetParameter))
  const neededNames = collectAllParameterNames(queries)
  const toAppend = diff(neededNames, existingNames)
    .filter((name): boolean => name !== 'UcompanyId')
    .map((targetParameter) => ({ targetParameter, query: '', id: '' }))
  const toRemoveIndice = diff(existingNames, neededNames)
    .filter((name): boolean => name !== '')
    .map((name) => {
      return queries.findIndex((q) => q.targetParameter === name)
    })
  remove(toRemoveIndice)
  append(toAppend)
}

export const QuerySetFormUtil = {
  arrange,
  toFormData,
  toInput,
  toExecutionInput
}

export const QuerySetFormUtil_ForTestOnly = {
  collectAllParameterNames
}
