import { Help } from '@mui/icons-material'
import { IconButton, SxProps, Tooltip } from '@mui/material'
import { useSetAtom } from 'jotai'
import React from 'react'
import { HelpAtom } from './HelpAtom'
import { HelpContent } from './HelpContent'

export const HelpButton: React.FC<{
  helpContent: HelpContent
  sx?: SxProps
}> = ({ helpContent, sx }) => {
  const dispatch = useSetAtom(HelpAtom.atom)
  const button = (
    <IconButton
      sx={sx}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        dispatch(helpContent)
      }}
    >
      <Help />
    </IconButton>
  )

  return helpContent.tooltip ? (
    <Tooltip title={helpContent.tooltip} placement="right" arrow>
      {button}
    </Tooltip>
  ) : (
    button
  )
}
