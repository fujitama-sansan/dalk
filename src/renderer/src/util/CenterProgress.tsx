import { Box, CircularProgress } from '@mui/material'
import React from 'react'

export const CenterProgress: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(200,200,200,0.5)',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <CircularProgress color="secondary" />
  </Box>
)
