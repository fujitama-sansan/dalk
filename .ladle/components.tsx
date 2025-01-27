import '@fontsource/inter'
import type { GlobalProvider } from '@ladle/react'

import { ThemeProvider } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/ja'
import { Provider as JotaiProvider, createStore } from 'jotai'
import React from 'react'
import { BackendAtom } from 'src/renderer/src/ipc/BackendAtom'
import { MockBackendEventApi } from 'src/renderer/src/testlib/MockBackendEventApi'
import { makeMockBackend } from 'src/renderer/src/testlib/backendMock'
import { dalkTheme } from '../src/renderer/src/app/DalkTheme'
import '../src/renderer/src/assets/base.css'
import { ConfirmDialog } from '../src/renderer/src/util/ConfirmDialog'

export const Provider: GlobalProvider = ({ children }) => {
  const store = createStore()
  store.set(BackendAtom.eventApiAtom, MockBackendEventApi.instance)
  store.set(BackendAtom.atom, makeMockBackend(500))
  return (
    <JotaiProvider store={store}>
      <CssBaseline />
      <ThemeProvider theme={dalkTheme}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
          <React.Suspense fallback="...loading...">{children}</React.Suspense>
        </LocalizationProvider>
        <ConfirmDialog />
      </ThemeProvider>
    </JotaiProvider>
  )
}
