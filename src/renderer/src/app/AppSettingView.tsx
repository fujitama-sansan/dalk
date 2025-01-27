import { AccountCircle } from '@mui/icons-material/'
import { Box, IconButton, Menu, MenuItem, Popover, Select, Snackbar, Stack } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { Ucompany, User, dbSettingIsFilled } from '../../../common/interface'
import { DbSettingAtom } from '../dbSetting/DbSettingAtom'
import { AppSettingAtom } from './AppSettingAtom'
import { OperatorSettingForm } from './OperatorSettingForm'

export const AppSettingView: React.FC = () => {
  return (
    <Stack direction="row" gap={1} alignItems="center" flexGrow={1} ml={3}>
      <Box sx={{ color: 'gray', ml: 'auto' }}>|</Box>
      <DbSettingSelectorView />
      <OperatorView />
    </Stack>
  )
}

const DbSettingSelectorView: React.FC = () => {
  const [setting, dispatch] = useAtom(AppSettingAtom.atom)
  const dbSettings = useAtomValue(DbSettingAtom.listAtom)
  const selectableItems = dbSettings.items.filter(dbSettingIsFilled)

  return (
    <Stack direction="row" gap={1} alignItems="center">
      <Select
        size="small"
        value={setting.data.dbSettingId || '-'}
        onChange={(e) => {
          dispatch(
            AppSettingAtom.SelectDbSetting(
              e.target.value === '-' ? null : (e.target.value as string)
            )
          )
        }}
        disabled={selectableItems.length === 0}
        sx={{
          backgroundColor: 'background.paper'
        }}
      >
        <MenuItem value="-">未選択</MenuItem>
        {selectableItems.map((item, i) => (
          <MenuItem key={i} value={item.id}>
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  )
}

const OperatorView: React.FC = () => {
  const setting = useAtomValue(AppSettingAtom.atom)
  const [modalState, setModalState] = React.useState<{
    open: boolean
    anchorEl: HTMLButtonElement | null
  }>({
    open: false,
    anchorEl: null
  })
  const handleButtonClick: React.MouseEventHandler<HTMLButtonElement> = (e) =>
    setModalState({ open: true, anchorEl: e.currentTarget })

  return (
    <>
      <Stack direction="row" gap={1} alignItems="center">
        {setting.state === 'Complete' ? (
          <UserView ucompany={setting.ucompany} operatorUser={setting.operatorUser} />
        ) : null}
        <IconButton
          color="primary"
          disabled={!setting.data.dbSettingId}
          onClick={handleButtonClick}
          size="small"
          sx={{ borderRadius: 20, color: 'white' }}
        >
          <AccountCircle sx={{ scale: '150%' }} />
        </IconButton>
      </Stack>
      <Popover
        open={modalState.open}
        anchorEl={modalState.anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        onClose={() => {
          setModalState({ open: false, anchorEl: null })
        }}
      >
        {modalState.open ? (
          <OperatorSettingForm
            onClose={() => {
              setModalState({ open: false, anchorEl: null })
            }}
          />
        ) : null}
      </Popover>
    </>
  )
}

const UserView: React.FC<{ ucompany: Ucompany; operatorUser: User }> = ({
  ucompany,
  operatorUser
}) => {
  const [open, setOpen] = React.useState(false)
  const [snackMessage, setSnackMessage] = React.useState('')
  const ref = React.useRef<HTMLDivElement>(null)
  const CopyItem: React.FC<{ label: string; content: string | null }> = React.useCallback(
    ({ label, content }) => (
      <MenuItem
        onClick={() => {
          if (content) {
            navigator.clipboard.writeText(content)
            setSnackMessage(`${label}=${content} をクリップボードにコピーしました`)
          }
        }}
      >
        {label}: {content}
      </MenuItem>
    ),
    [setSnackMessage]
  )
  const { userName, ucompanyId, userId, billingGroupIds, uuid } = operatorUser
  return (
    <>
      <Stack
        ref={ref}
        direction="column"
        sx={{
          backgroundColor: 'rgba(200,200,200,0.3)',
          py: 0.2,
          px: 1,
          fontSize: '70%',
          borderRadius: 4
        }}
        onClick={() => setOpen(true)}
      >
        <Box>Ucompany: {ucompany.ucompanyName}</Box>
        <Box>Operator: {userName}</Box>
      </Stack>
      <Menu open={open} onClose={() => setOpen(false)} anchorEl={ref.current}>
        <CopyItem label="UcompanyId" content={ucompanyId} />
        <CopyItem label="UserId" content={userId} />
        <CopyItem label="BillingGroupId" content={billingGroupIds[0]} />
        <CopyItem label="Uuid" content={uuid} />
      </Menu>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={!!snackMessage}
        autoHideDuration={2000}
        onClose={() => setSnackMessage('')}
        message={snackMessage}
      />
    </>
  )
}
