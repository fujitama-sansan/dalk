import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Button, Checkbox, FormControlLabel, IconButton, Stack, TextField } from '@mui/material'
import { useAtom, useSetAtom } from 'jotai'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { DbSetting, DbSettingUpdateInput } from '../../../common/interface'
import { DbSettingAtom } from './DbSettingAtom'

type FormData = {
  name: string
  user: string
  password: string
  host: string | null
  port: number | null
  staging: boolean
}

const toNumber = (value: number | string | null): number | null =>
  value !== null && value !== '' ? Number(value) : null

const toFormData = (data: DbSetting): FormData => ({
  name: data.name,
  user: data.user,
  password: data.password,
  host: data.staging ? null : data.host,
  port: data.staging ? null : data.port,
  staging: data.staging
})

const toInput = (data: FormData): DbSettingUpdateInput =>
  data.staging
    ? {
        name: data.name,
        user: data.user,
        password: data.password,
        staging: true
      }
    : {
        name: data.name,
        user: data.user,
        password: data.password,
        host: data.host || '',
        port: toNumber(data.port) || 0,
        staging: false
      }

export const DbSettingForm: React.FC<{ dbSettingId: string }> = ({ dbSettingId }) => {
  const [setting, dispatch] = useAtom(DbSettingAtom.itemAtom(dbSettingId))
  const originalValues = React.useMemo(() => toFormData(setting), [setting])
  const form = useForm<FormData>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    values: originalValues
  })
  const { control, handleSubmit, formState } = form
  const [showPassword, setShowPassword] = React.useState(false)
  const [isStaging, setStaging] = React.useState(setting.staging)
  const setSelectable = useSetAtom(DbSettingAtom.selectableAtom)
  const reset = (): void => {
    form.reset()
    const values = form.getValues()
    setStaging(values.staging)
    setShowPassword(false)
  }
  React.useEffect(() => {
    setSelectable(!formState.isDirty && formState.isValid)
  }, [formState.isDirty, formState.isValid])
  React.useEffect(() => {
    reset()
  }, [dbSettingId])

  return (
    <Stack
      className="main-scroll-pane"
      direction="column"
      gap={2}
      component="form"
      onSubmit={handleSubmit((data) => dispatch(DbSettingAtom.Update(toInput(data))))}
      flexGrow={1}
      p={2}
    >
      <Controller
        name="name"
        control={control}
        rules={{ required: '設定名を入力してください' }}
        render={({ field, formState: { errors } }) => (
          <TextField
            {...field}
            label="設定名"
            size="small"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />
      <Stack direction="row" gap={2}>
        <Controller
          name="staging"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              sx={{ flexGrow: 0, pl: 2 }}
              control={
                <Checkbox
                  {...field}
                  size="small"
                  checked={field.value}
                  onChange={(e) => {
                    field.onChange(e)
                    setStaging(e.target.checked)
                  }}
                />
              }
              label="Staging"
            />
          )}
        />
        {isStaging ? (
          <>
            <TextField
              value="data-*.master.staging.sansan.com"
              label="ホスト"
              size="small"
              disabled
              sx={{ flexGrow: 1 }}
            />
            <TextField value="2000*" label="ポート" type="text" size="small" disabled />
          </>
        ) : (
          <>
            <Controller
              name="host"
              control={control}
              rules={{ required: 'DBホスト名またはIPアドレスを入力してください' }}
              render={({ field, formState: { errors } }) => (
                <TextField
                  {...field}
                  label="ホスト"
                  size="small"
                  error={!!errors.host}
                  helperText={errors.host?.message}
                  sx={{ flexGrow: 1 }}
                />
              )}
            />
            <Controller
              name="port"
              control={control}
              rules={{
                required: 'ポート番号を入力してください',
                max: { value: 65535, message: '1から65535の範囲で入力してください' },
                min: { value: 1, message: '1から65535の範囲で入力してください' },
                pattern: { value: /^\d+$/, message: '数字で入力してください' }
              }}
              render={({ field, formState: { errors } }) => (
                <TextField
                  {...field}
                  label="ポート"
                  type="number"
                  size="small"
                  error={!!errors.port}
                  helperText={errors.port?.message}
                />
              )}
            />
          </>
        )}
      </Stack>
      <Controller
        name="user"
        control={control}
        rules={{ required: 'ユーザ名を入力してください' }}
        render={({ field, formState: { errors } }) => (
          <TextField
            {...field}
            label="ユーザ名"
            size="small"
            error={!!errors.user}
            helperText={errors.user?.message}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        rules={{ required: 'パスワードを入力してください' }}
        render={({ field, formState: { errors } }) => (
          <TextField
            {...field}
            label="パスワード"
            size="small"
            error={!!errors.password}
            helperText={errors.password?.message}
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => {
                    setShowPassword(!showPassword)
                  }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
          />
        )}
      />
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }} gap={2}>
        <Button
          variant="outlined"
          onClick={() => {
            reset()
          }}
          disabled={!formState.isDirty}
        >
          リセット
        </Button>
        <Button variant="contained" type="submit" disabled={!formState.isDirty}>
          保存
        </Button>
      </Stack>
    </Stack>
  )
}
