import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField
} from '@mui/material'
import { atom, useAtom, useSetAtom } from 'jotai'
import React from 'react'

type DialogState =
  | {
      open: boolean
      title: string
      message: string
      prompt?: false
      onOk: () => void
    }
  | {
      open: boolean
      title: string
      message: string
      prompt: true
      onOk: (value: string) => void
    }

const initState: DialogState = {
  open: false,
  title: '',
  message: '',
  prompt: undefined,
  onOk: () => {}
}

const openAtom = atom<DialogState>(initState)

type Open = (option: Omit<DialogState, 'open'>) => void

export const useConfirmDialog = (): Open => {
  const setState = useSetAtom(openAtom)
  return ({ title, message, prompt, onOk }) => {
    setState({ open: true, title, message, prompt, onOk } as DialogState)
  }
}

export const ConfirmDialog: React.FC = () => {
  const [{ open, title, message, prompt, onOk }, setState] = useAtom(openAtom)
  const handleClose = (): void => {
    setValue('')
    setState(initState)
  }
  const handleOk = (): void => {
    onOk(value)
    handleClose()
  }
  const [value, setValue] = React.useState('')
  return (
    <Dialog role="alertdialog" open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <Divider />
      <DialogContent>
        <Box component="p" sx={{ mb: 1 }}>
          {message}
        </Box>
        {prompt && (
          <TextField
            size="small"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            variant="outlined"
            sx={{ width: 360 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleOk}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}
