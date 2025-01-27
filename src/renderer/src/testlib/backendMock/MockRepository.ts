import { Entity } from '../../../../common/interface'
import { MockIdGenerator } from './MockIdGenerator'

export interface MockRepositoryAdapter<T extends Entity> {
  initialize: (idGenerator: MockIdGenerator) => ReadonlyArray<T>
  create: (id: string) => T
}

export class MockRepository<T extends Entity> {
  private readonly data: T[]
  private readonly idGenerator: MockIdGenerator

  constructor(
    idPrefix: string,
    private readonly adapter: MockRepositoryAdapter<T>
  ) {
    this.idGenerator = new MockIdGenerator(idPrefix)
    this.data = adapter.initialize(this.idGenerator).slice()
  }

  getAll(): ReadonlyArray<T> {
    return this.data
  }

  get(id: string): T | null {
    return this.data.find((item) => item.id === id) || null
  }

  getAt(idx: number): T | null {
    return this.data[idx] || null
  }

  create(): T {
    const id = this.idGenerator.generate()
    const newItem = this.adapter.create(id)
    this.data.push(newItem)
    return newItem
  }

  update(id: string, input: Partial<T>): void {
    const idx = this.data.findIndex((item) => item.id === id)
    if (idx >= 0) {
      this.data[idx] = { ...this.data[idx], ...input, id }
    }
  }

  remove(id: string): void {
    const idx = this.data.findIndex((item) => item.id === id)
    if (idx >= 0) {
      this.data.splice(idx, 1)
    }
  }
}
