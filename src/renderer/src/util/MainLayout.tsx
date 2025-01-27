import { Alert, Stack, Typography } from '@mui/material'
import { useAtomValue } from 'jotai'
import React from 'react'
import { AppSettingAtom } from '../app/AppSettingAtom'
import { HelpButton } from '../help/HelpButton'
import { HelpContent } from '../help/HelpContent'

export const MainLayout: React.FC<
  React.PropsWithChildren<{
    title: string
    operatorNeeded?: boolean
    helpContent?: HelpContent
  }>
> = ({ title, operatorNeeded = false, helpContent, children }) => {
  const appSetting = useAtomValue(AppSettingAtom.atom)
  if (operatorNeeded && !appSetting.operatorUser) {
    return (
      <Stack direction="column" flexGrow={1} p={2}>
        <Alert severity="error">DB設定または操作ユーザーが選択されていません</Alert>
      </Stack>
    )
  }
  return (
    <Stack
      direction="column"
      flexGrow={1}
      sx={{
        height: '100%',
        ' .main-scroll-pane': {
          overflowY: 'auto',
          height: 'var(--sz-main-height)',
          width: '100%'
        }
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        px={2}
        sx={{
          height: 'var(--sz-header-height)',
          flexGrow: 0,
          h2: {
            fontSize: '120%'
          }
        }}
      >
        <Typography variant="h2">{title}</Typography>
        {helpContent && <HelpButton helpContent={helpContent} sx={{ ml: 2 }} />}
      </Stack>
      {children}
    </Stack>
  )
}
