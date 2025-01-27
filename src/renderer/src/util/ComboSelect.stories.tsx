import { Story, StoryDefault } from '@ladle/react'
import { Stack } from '@mui/material'
import React from 'react'
import { ComboSelect } from './ComboSelect'

type ValueT = {
  id: number
  label: string
}

const values: ValueT[] = [
  { id: 1, label: 'test' },
  { id: 2, label: 'foo' },
  { id: 3, label: 'bar' }
]

export const Default: Story = () => {
  const [value, setValue] = React.useState<ValueT | null>(null)
  return (
    <Stack sx={{ pt: 3 }} direction="column">
      selcted: {value && `${value.label}, ${value.id}`}
      <ComboSelect
        size="small"
        fullWidth
        value={value}
        options={values}
        label="Select test"
        defaultInputValue="e"
        getOptionLabel={(v) => v.label}
        getOptionValue={(v) => v.id}
        onChange={(v) => setValue(v)}
      />
    </Stack>
  )
}

export const Deletable: Story = () => {
  const [value, setValue] = React.useState<ValueT | null>(null)
  return (
    <Stack sx={{ pt: 3 }} direction="column">
      selcted: {value && `${value.label}, ${value.id}`}
      <ComboSelect
        size="small"
        fullWidth
        value={value}
        options={values}
        label="Select test"
        getOptionLabel={(v) => v.label}
        getOptionValue={(v) => v.id}
        onChange={(v) => setValue(v)}
        showInput={false}
        clearable
      />
    </Stack>
  )
}

export default {
  title: '_9 util/ComboSelect'
} satisfies StoryDefault
