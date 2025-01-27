import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import { BackendEvent, BackendEventApi, BackendEventListenFunction } from '../common/interface'

// Custom APIs for renderer
const api: BackendEventApi = {
  listen: <T extends BackendEvent>(type: T['type'], func: BackendEventListenFunction<T>): void => {
    ipcRenderer.on(type, (_, event: BackendEvent) => {
      if (event.type === type) {
        func(event as T)
      }
    })
  },
  release: <T extends BackendEvent>(type: T['type']): void => {
    ipcRenderer.removeAllListeners(type)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
