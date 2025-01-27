import { Provider, createStore } from 'jotai'
import React from 'react'
import { BackendAtom } from '../ipc/BackendAtom'
import { MockBackendEventApi } from './MockBackendEventApi'
import { makeMockBackend } from './backendMock'

export const TestWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const testStore = createStore()
  testStore.set(BackendAtom.eventApiAtom, MockBackendEventApi.instance)
  testStore.set(BackendAtom.atom, makeMockBackend(0))
  return (
    <Provider store={testStore}>
      <React.Suspense fallback={<div>Loading...</div>}>{children}</React.Suspense>
    </Provider>
  )
}
