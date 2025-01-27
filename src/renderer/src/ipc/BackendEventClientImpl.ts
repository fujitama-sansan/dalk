import type { BackendEventApi } from '../../../common/interface'

export const BackendEventClientImpl = {
  get: (): BackendEventApi => window.api as BackendEventApi
} as const
