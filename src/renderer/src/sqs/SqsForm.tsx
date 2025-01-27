import { Box, Button, Stack, TextField } from '@mui/material'
import { grey } from '@mui/material/colors'
import { useAtom } from 'jotai'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { EntityInput, SqsMessageDefinition, SqsQueue } from '../../../common/interface'
import { Result, resultifySync } from '../../../common/util/Result'
import { ComboSelect } from '../util/ComboSelect'
import { SQSMessageDefinitionAtom } from './atom/SqsMessageDefinitionAtom'
import { SqsQueuesAtom } from './atom/SqsQueuesAtom'

type FormData = Readonly<{
  name: string
  queue: SqsQueue | null
  messageClass: string
  correlationId: string
  graph: string
  preview: string
}>

type PreviewInput = Readonly<{
  messageClass: string
  correlationId: string
  graph: string
}>

const makePreview = (data: PreviewInput): Result<string> =>
  resultifySync(() => {
    const obj = {
      type: `${data.messageClass}, Sansan.Application`
    }
    if (data.correlationId) {
      obj['correlationId'] = data.correlationId
    }
    obj['graph'] = JSON.parse(data.graph)
    return JSON.stringify(obj, null, 2)
  })

const toFormData = (item: SqsMessageDefinition): FormData => {
  const preview = makePreview(item)
  return {
    name: item.name,
    queue: item.queue,
    messageClass: item.messageClass,
    correlationId: item.correlationId,
    graph: item.graph,
    preview: preview.success ? preview.value : ''
  }
}

const toInput = (state: FormData): EntityInput<SqsMessageDefinition> => {
  return {
    name: state.name,
    queue: state.queue,
    messageClass: state.messageClass,
    correlationId: state.correlationId,
    graph: state.graph
  }
}

export const SqsForm: React.FC<{ id: string }> = ({ id }) => {
  const [state, dispatch] = useAtom(SQSMessageDefinitionAtom.atom(id))
  const origData = React.useMemo(() => toFormData(state), [state])
  const [queues, dispatchQueues] = useAtom(SqsQueuesAtom.atom)
  const form = useForm<FormData>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    values: origData
  })
  const { control, formState } = form

  const updatePreview = (value: string, name: keyof PreviewInput): void => {
    const result = makePreview({ ...form.getValues(), [name]: value })
    if (result.success) {
      form.setValue('preview', result.value)
      form.clearErrors('preview')
    } else {
      form.setError('preview', { message: result.error })
    }
  }

  const [queuePrefix, setQueuePrefix] = React.useState('')

  return (
    <Stack
      direction="column"
      gap={2}
      p={2}
      className="main-scroll-pane"
      component="form"
      onSubmit={form.handleSubmit((data) => dispatch(SQSMessageDefinitionAtom.Save(toInput(data))))}
    >
      <Controller
        name="name"
        control={control}
        rules={{ required: '設定名を入力してください' }}
        render={({ field, formState: { errors } }) => (
          <TextField
            {...field}
            required
            label="Name"
            size="small"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />
      <Controller
        name="queue"
        control={control}
        render={({ field }) => (
          <ComboSelect
            required
            value={field.value}
            options={makeQueueOptions(queues.queues, field.value)}
            label="Queue"
            helperText={field.value?.url}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.url}
            onChange={(queue) => {
              form.setValue('queue', queue)
            }}
            inputChangeDuration={300}
            onInputChange={(v) => {
              setQueuePrefix(v)
              dispatchQueues(SqsQueuesAtom.Search(v))
            }}
            defaultInputValue={queuePrefix}
            size="small"
          />
        )}
      />
      <Controller
        name="messageClass"
        rules={{ required: 'Messageのクラス名を入力してください' }}
        control={control}
        render={({ field, formState: { errors } }) => (
          <TextField
            {...field}
            required
            onChange={(e) => {
              updatePreview(e.target.value, field.name)
              field.onChange(e)
            }}
            label="Message class"
            size="small"
            placeholder="Messageの名前空間つきクラス名"
            error={!!errors.messageClass}
            helperText={errors.messageClass?.message}
          />
        )}
      />
      <Controller
        name="correlationId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            onChange={(e) => {
              field.onChange(e)
              updatePreview(e.target.value, field.name)
            }}
            label="CorrelationId"
            size="small"
            placeholder=""
          />
        )}
      />
      <Controller
        name="graph"
        control={control}
        rules={{ required: 'グラフを入力してください' }}
        render={({ field, formState: { errors } }) => (
          <TextField
            {...field}
            onChange={(e) => {
              field.onChange(e)
              updatePreview(e.target.value, field.name)
            }}
            required
            label="Graph"
            size="small"
            multiline
            minRows={3}
            maxRows={10}
            error={!!errors.preview || !!errors.graph}
            helperText={errors.preview?.message || errors.graph?.message}
          />
        )}
      />
      <Stack direction="row" gap={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          disabled={!formState.isDirty}
          onClick={() => {
            form.reset()
          }}
        >
          リセット
        </Button>
        <Button
          variant="contained"
          disabled={!formState.isDirty || !formState.isValid}
          type="submit"
        >
          保存
        </Button>
        <Button
          variant="contained"
          disabled={!formState.isValid}
          onClick={() => {
            const message = form.getValues('preview')
            const queue = form.getValues('queue')
            if (message && queue) {
              dispatchQueues(SqsQueuesAtom.Send(queue, message))
            }
          }}
        >
          送信
        </Button>
      </Stack>
      <Controller
        name="preview"
        control={control}
        render={({ field }) => (
          <Box
            sx={{
              p: 2,
              backgroundColor: grey[100],
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap'
            }}
          >
            {field.value}
          </Box>
        )}
      />
    </Stack>
  )
}

const makeQueueOptions = (
  options: ReadonlyArray<SqsQueue>,
  selected: SqsQueue | null
): ReadonlyArray<SqsQueue> => {
  if (selected) {
    if (options.find((o) => o.url === selected.url)) {
      return options
    } else {
      return [...options, selected]
    }
  } else {
    return options
  }
}
