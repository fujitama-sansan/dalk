import { v4 as uuidv4 } from 'uuid'
import { IdGenerator } from './IdGenerator'

export class GuidGenerator implements IdGenerator {
  generate(): string {
    return uuidv4()
  }
}
