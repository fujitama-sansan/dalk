import { Button, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import React from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { AppSettingAtom } from '../app/AppSettingAtom'
import { QueryExecutionResultView } from './QueryExecutionResultView'
import { QuerySetFormData, QuerySetFormUtil } from './QuerySetFormUtil'
import { QueryExecutionAtom } from './atom/QueryExecutionAtom'
import { QuerySetDefinitionAtom } from './atom/QuerySetDefinitionAtom'

export const QuerySetForm: React.FC<{ id: string }> = ({ id }) => {
  const [item, dispatch] = useAtom(QuerySetDefinitionAtom.atom(id))
  const dispatchExecute = useSetAtom(QueryExecutionAtom.atom)
  const origData = React.useMemo(() => QuerySetFormUtil.toFormData(item), [item])
  const executionArgs = useAtomValue(QueryExecutionAtom.argsAtom)
  const appSetting = useAtomValue(AppSettingAtom.atom)
  const executable = !!appSetting.operatorUser

  const form = useForm<QuerySetFormData>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    values: origData
  })
  const { control, formState } = form
  const { errors } = formState
  const fieldArray = useFieldArray({ control, name: 'queries' })
  const [showResult, setShowResult] = React.useState(true)
  const arrangeQueries = (): void => {
    QuerySetFormUtil.arrange({
      queries: form.getValues().queries,
      append: (items) => fieldArray.append(items),
      remove: (indice) => fieldArray.remove(indice)
    })
  }

  return (
    <Stack
      direction="column"
      gap={2}
      p={2}
      className="main-scroll-pane"
      component="form"
      onSubmit={form.handleSubmit((data) => {
        dispatch(QuerySetDefinitionAtom.Save(QuerySetFormUtil.toInput(data)))
      })}
    >
      <Controller
        name="name"
        control={control}
        rules={{ required: '保存名を入力してください' }}
        render={({ field }) => (
          <TextField
            required
            {...field}
            label="保存名"
            size="small"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            label="このクエリの説明"
            size="small"
            {...field}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        )}
      />

      <Controller
        name="ucompanyIds"
        control={control}
        rules={{ required: '入力してください' }}
        render={({ field }) => (
          <TextField
            {...field}
            required
            label="UcompanyIdのリスト、または取得するSELECT文"
            size="small"
            error={!!errors.ucompanyIds}
            helperText={errors.ucompanyIds?.message}
            minRows={1}
            maxRows={10}
            multiline
          />
        )}
      />

      {fieldArray.fields.map((field, index) => {
        const targetParameter = form.watch(`queries.${index}.targetParameter`)
        const errorText = errors.queries && errors.queries[index]?.query?.message
        return (
          <Controller
            key={field.id}
            name={`queries.${index}.query`}
            control={control}
            rules={{
              required: 'クエリを入力してください'
            }}
            render={({ field }) => (
              <TextField
                {...field}
                onBlur={() => {
                  field.onBlur()
                  arrangeQueries()
                }}
                label={
                  targetParameter ? `@${targetParameter}の値、または取得するSELECT文` : 'クエリ本体'
                }
                multiline
                required
                size="small"
                minRows={1}
                maxRows={30}
                error={!!errorText}
                helperText={errorText}
              />
            )}
          />
        )
      })}

      <Stack
        direction="column"
        sx={{
          justifyContent: 'flex-end',
          position: 'sticky',
          bottom: -16,
          right: 0,
          left: 0,
          backgroundColor: 'white',
          borderTop: '1px solid gray',
          mx: -2,
          zIndex: 2
        }}
        gap={0}
      >
        <Stack direction="row" gap={2} px={2} py={1} alignItems="flex-start">
          <Stack direction="row" gap={2} py={1} alignItems="flex-start">
            <Typography variant="body2" pt={1}>
              グラフ設定：
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={showResult}
                  onChange={() => {
                    setShowResult(!showResult)
                  }}
                />
              }
              label="結果を表示"
            />
            <Controller
              name="threshold"
              control={control}
              rules={{
                required: '数値を入力してください',
                max: { value: 10000, message: '10000以下の値を入力してください' },
                min: { value: 0, message: '0以上の値を入力してください' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  required
                  label="しきい値(ms)"
                  size="small"
                  sx={{ width: 120 }}
                  inputProps={{ sx: { textAlign: 'right' } }}
                  error={!!errors.threshold}
                  helperText={errors.threshold?.message}
                />
              )}
            />
            <Controller
              name="maxCount"
              control={control}
              rules={{
                required: '数値を入力してください',
                max: { value: 100, message: '100以下の値を入力してください' },
                min: { value: 1, message: '1以上の値を入力してください' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  required
                  label="最大表示件数"
                  size="small"
                  sx={{ width: 120 }}
                  inputProps={{ sx: { textAlign: 'right' } }}
                  error={!!errors.maxCount}
                  helperText={errors.maxCount?.message}
                />
              )}
            />
          </Stack>
          <Stack
            direction="row"
            gap={2}
            py={2}
            ml="auto"
            justifyContent="flex-end"
            alignItems="flex-start"
          >
            <Button
              variant="outlined"
              onClick={() => {
                form.reset(origData)
              }}
              disabled={!formState.isDirty}
            >
              リセット
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={!formState.isValid || !formState.isDirty}
            >
              保存
            </Button>
            {executionArgs && id === executionArgs.definitionId ? (
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  dispatchExecute(QueryExecutionAtom.Stop(id))
                }}
              >
                中止
              </Button>
            ) : (
              <Button
                variant="contained"
                color="warning"
                disabled={!formState.isValid || !executable}
                onClick={() => {
                  const data = form.getValues()
                  dispatchExecute(
                    QueryExecutionAtom.Start(
                      id,

                      QuerySetFormUtil.toExecutionInput(data),
                      data.threshold,
                      data.maxCount
                    )
                  )
                }}
              >
                実行
              </Button>
            )}
          </Stack>
        </Stack>
        {showResult && (
          <React.Suspense fallback="...">
            <QueryExecutionResultView definitionId={id} />
          </React.Suspense>
        )}
      </Stack>
    </Stack>
  )
}
