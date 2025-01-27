import '@fontsource/inter'
import { ThemeProvider } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import 'dayjs/locale/ja'
import { Provider } from 'jotai'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { dalkTheme } from '../app/DalkTheme'
import '../assets/base.css'
import { QuerySetResult } from './QuerySetResult'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider>
      <CssBaseline />
      <React.Suspense fallback="Loading...">
        <ThemeProvider theme={dalkTheme}>
          <QuerySetResult />
        </ThemeProvider>
      </React.Suspense>
    </Provider>
  </React.StrictMode>
)
