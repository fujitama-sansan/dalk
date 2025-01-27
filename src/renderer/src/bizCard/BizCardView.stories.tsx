import { Story, StoryDefault } from '@ladle/react'
import { Box } from '@mui/material'
import { BizCardView } from './BizCardView'
import { BizCardListView } from './list/BizCardListView'

export const BizCard: Story = () => {
  return <BizCardView />
}

export const BizCardList: Story = () => {
  return (
    <Box sx={{ height: '100vh' }}>
      <BizCardListView />
    </Box>
  )
}

export default {
  title: '_3 bizcard/1 Biz card view'
} satisfies StoryDefault
