import { Close } from '@mui/icons-material'
import {
  FormControl,
  FormControlProps,
  FormHelperText,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Select,
  SelectProps
} from '@mui/material'
import React from 'react'

type ComboSelectProps<T> = {
  value: T | null
  defaultInputValue?: string
  options: ReadonlyArray<T>
  inputChangeDuration?: number
  onInputChange?: (newInputValue: string) => void
  onChange: (newValue: T | null) => void
  getOptionLabel?: (option: T) => string
  getOptionValue?: (option: T) => string | number
  label?: SelectProps['label']
  error?: FormControlProps['error']
  helperText?: string
  size?: FormControlProps['size']
  fullWidth?: FormControlProps['fullWidth']
  showInput?: boolean
  clearable?: boolean
  renderValue?: SelectProps['renderValue']
  required?: FormControlProps['required']
}

export function ComboSelect<T>(props: ComboSelectProps<T>): React.ReactNode {
  const val = React.useCallback(
    (v: typeof props.value): string | null => {
      if (props.getOptionValue) {
        return v !== null ? String(props.getOptionValue(v)) : null
      } else {
        return String(v)
      }
    },
    [props.getOptionValue, typeof props.value]
  )

  const label = React.useCallback(
    (v: typeof props.value): string => {
      if (props.getOptionLabel) {
        return v !== null ? props.getOptionLabel(v) : ''
      } else {
        return String(v)
      }
    },
    [props.getOptionLabel, typeof props.value]
  )
  const [inputValue, setInputValue] = React.useState(props.defaultInputValue || '')
  const inputChangeTimeout = React.useRef(0)
  const showInput = props.showInput !== false
  const clearable = !!props.clearable
  const handleInputValue = React.useCallback(
    (v: string): void => {
      setInputValue(v)
      const { onInputChange } = props
      if (onInputChange) {
        if (props.inputChangeDuration) {
          window.clearTimeout(inputChangeTimeout.current)
          inputChangeTimeout.current = window.setTimeout(
            () => onInputChange(v),
            props.inputChangeDuration
          )
        } else {
          onInputChange(v)
        }
      }
    },
    [props.inputChangeDuration, props.onInputChange, inputChangeTimeout]
  )

  return (
    <FormControl
      fullWidth={props.fullWidth}
      size={props.size}
      error={props.error}
      required={props.required}
    >
      <InputLabel>{props.label}</InputLabel>
      <Select
        label={props.label}
        autoWidth={false}
        onChange={(e) => {
          if (props.onChange && e.target.value !== '--') {
            const newValue = props.options.find((o) => val(o) === e.target.value) || null
            props.onChange(newValue)
          }
        }}
        value={val(props.value) || ''}
        endAdornment={
          clearable ? (
            <IconButton
              onClick={() => {
                if (props.onChange) {
                  props.onChange(null)
                }
              }}
              sx={{ mr: 2 }}
              size="small"
            >
              <Close />
            </IconButton>
          ) : undefined
        }
        renderValue={props.renderValue}
      >
        {showInput && (
          <Input
            disabled={false}
            value={inputValue}
            defaultValue={inputValue}
            onFocus={(e) => {
              e.stopPropagation()
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Down' || e.key === 'ArrowDown') {
                console.log('down')
                return
              }
              e.stopPropagation()
            }}
            onChange={(e) => {
              handleInputValue(e.target.value)
            }}
            size="small"
            fullWidth
            sx={{ px: 1 }}
            autoFocus
          />
        )}

        {props.options
          .filter((option) => {
            return inputValue
              ? label(option).toLowerCase().includes(inputValue.toLowerCase())
              : true
          })
          .map((option, i) => (
            <MenuItem key={i} value={val(option) || ''}>
              {label(option)}
            </MenuItem>
          ))}
      </Select>
      <FormHelperText>{props.helperText}</FormHelperText>
    </FormControl>
  )
}
