import { Cable } from '@mui/icons-material/'
import { Box, IconButton, Stack, TextField } from '@mui/material'
import { useAtom } from 'jotai'
import React from 'react'
import { User } from '../../../common/interface'
import { CenterProgress } from '../util/CenterProgress'
import { ComboSelect } from '../util/ComboSelect'
import { AppSettingAtom } from './AppSettingAtom'
import { UserListAtom } from './UserListAtom'

export const OperatorSettingForm: React.FC<{
  onClose: () => void
}> = ({ onClose }) => {
  const [setting, dispatchSetting] = useAtom(AppSettingAtom.atom)
  const [ucompanyIdInput, setUcompanyIdInput] = React.useState(setting.data.ucompanyId)
  const [loading, setLoading] = React.useState(false)

  const dispatchSetUcompanyId = async (): Promise<void> => {
    setLoading(true)
    await dispatchSetting(AppSettingAtom.SetUcompanyId(ucompanyIdInput))
    setLoading(false)
  }
  return (
    <Box p={2} sx={{ width: 240 }}>
      <Stack direction="column" gap={2}>
        <TextField
          error={!!(setting.error && !setting.ucompany)}
          label="UcompanyId"
          size="small"
          placeholder="UCompanyId"
          InputProps={{
            onKeyDown: (e) => {
              if (e.key === 'Enter') {
                dispatchSetUcompanyId()
              }
            },
            endAdornment: (
              <IconButton onClick={dispatchSetUcompanyId}>
                <Cable />
              </IconButton>
            )
          }}
          value={ucompanyIdInput || ''}
          onChange={(e) => setUcompanyIdInput(e.target.value)}
          helperText={setting.ucompany ? setting.ucompany.ucompanyName : setting.error}
        />
        <React.Suspense fallback={<CenterProgress />}>
          <UserSelector
            selectedUser={setting.operatorUser}
            onSelected={(user) => {
              dispatchSetting(AppSettingAtom.SelectUser(user))
              onClose()
            }}
          />
        </React.Suspense>
      </Stack>
      {loading && <CenterProgress />}
    </Box>
  )
}

const UserSelector: React.FC<{
  selectedUser: User | null
  onSelected: (user: User | null) => void
}> = ({ selectedUser, onSelected }) => {
  const [userList, dispatchUserList] = useAtom(UserListAtom.atom)
  const [query, setQuery] = React.useState(userList.query)
  return (
    <ComboSelect
      label="Operator User"
      size="small"
      value={selectedUser}
      options={userList.users}
      getOptionLabel={(user) => user.userName}
      getOptionValue={(user) => user.userId}
      onChange={(selected) => {
        onSelected(selected)
      }}
      inputChangeDuration={250}
      defaultInputValue={query}
      onInputChange={(value) => {
        console.log('onInputChange', { value })
        setQuery(value)
        dispatchUserList(UserListAtom.Search(value))
      }}
      helperText={(selectedUser && selectedUser.loginEmail) || ''}
    />
  )
}
