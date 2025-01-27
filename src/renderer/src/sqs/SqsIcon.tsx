import { Icon } from '@mui/material'
import React from 'react'
import iconUrl from '../../public/sqs-icon.svg'

export const SqsIcon: React.FC = () => {
  return (
    <Icon sx={{ textAlign: 'center', img: { height: '100%' } }}>
      <img src={iconUrl} />
    </Icon>
  )
}
