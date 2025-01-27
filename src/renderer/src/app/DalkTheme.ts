import { ThemeOptions, createTheme } from '@mui/material/styles'

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#0d47a1'
    },
    secondary: {
      main: '#4e342e'
    },
    background: {
      paper: '#f5f5f5'
    }
  }
}

export const dalkTheme = createTheme(themeOptions)
