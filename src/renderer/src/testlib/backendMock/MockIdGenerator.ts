export class MockIdGenerator {
  private counter = 1

  constructor(readonly prefix: string) {}

  generate(): string {
    return `${this.prefix}-id-${this.counter++}`
  }
}
