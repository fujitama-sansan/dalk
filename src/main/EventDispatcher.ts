import { BrowserWindow } from 'electron'
import { BackendEvent } from '../common/interface'

let browserWindow: BrowserWindow | null = null

const setBrowserWindow = (bw: BrowserWindow): void => {
  browserWindow = bw
}

const dispatch = (event: BackendEvent): void => {
  browserWindow?.webContents.send(event.type, event)
}

export const EventDispatcher = {
  setBrowserWindow,
  dispatch
}
