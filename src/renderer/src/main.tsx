import '@fontsource/inter'

import { ThemeProvider } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/ja'
import { Provider, createStore } from 'jotai'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { dalkTheme } from './app/DalkTheme'
import './assets/base.css'
import { BackendAtom } from './ipc/BackendAtom'
import { BackendClientFactory } from './ipc/BackendClient'
import { BackendEventClientImpl } from './ipc/BackendEventClientImpl'

const store = createStore()
store.set(BackendAtom.eventApiAtom, BackendEventClientImpl.get())
store.set(BackendAtom.atom, BackendClientFactory.create())

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <CssBaseline />
      <React.Suspense fallback="Loading...">
        <ThemeProvider theme={dalkTheme}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
            <App />
          </LocalizationProvider>
        </ThemeProvider>
      </React.Suspense>
    </Provider>
  </React.StrictMode>
)
