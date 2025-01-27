import { Story, StoryDefault } from '@ladle/react'
import { Person, Settings } from '@mui/icons-material'
import { Tab } from '@mui/material'
import React from 'react'
import { VerticalTabPanel } from './VerticalTabPanel'

export default {
  title: '_9 util/VerticalTabPanel'
} satisfies StoryDefault

export const Default: Story = () => {
  return (
    <VerticalTabPanel
      mapping={(value) => (value === 'setting' ? SettingPane : <div>{value}</div>)}
      initialValue="setting"
      sx={{
        height: '100%',
        backgroundColor: 'lightblue'
      }}
    >
      <Tab value="setting" label="Setting" icon={<Settings />} />
      <Tab value="b" label="Person" icon={<Person />} />
      <Tab value="c" label="Bottom" icon={<Person />} sx={{ mt: 'auto' }} />
    </VerticalTabPanel>
  )
}

const SettingPane: React.FC = () => <div>ComponentA</div>
