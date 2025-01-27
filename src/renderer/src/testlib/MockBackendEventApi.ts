import {
  BackendEvent,
  BackendEventApi,
  BackendEventListenFunction
} from '../../../common/interface'

export class MockBackendEventApi implements BackendEventApi {
  static readonly instance = new MockBackendEventApi()

  private listeners: Map<BackendEvent['type'], BackendEventListenFunction> = new Map()

  listen<T extends BackendEvent>(type: T['type'], func: BackendEventListenFunction<T>): void {
    this.listeners.set(type, func as BackendEventListenFunction)
  }

  release<T extends BackendEvent>(type: T['type']): void {
    if (this.listeners.has(type)) {
      this.listeners.delete(type)
    }
  }

  dispatch(event: BackendEvent): void {
    const func = this.listeners.get(event.type)
    if (func) {
      func(event)
    }
  }
}
