export type Entity = Readonly<{
  id: string
}>

export type EntityInput<T extends Entity> = Omit<T, 'id'>

export type EntityList<T extends Entity> = ReadonlyArray<T>
