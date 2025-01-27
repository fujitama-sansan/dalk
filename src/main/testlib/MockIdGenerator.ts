import { IdGenerator } from '../util/IdGenerator'

export class MockIdGenerator implements IdGenerator {
  private counter = 1

  generate(): string {
    return `id_${this.counter++}`
  }
}
