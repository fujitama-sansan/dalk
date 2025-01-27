import { Stack, SxProps, Tab, TabProps, Tabs } from '@mui/material'
import React from 'react'
import { CenterProgress } from './CenterProgress'

type Comp = React.ReactElement | React.FC | undefined
type MappingFunc = (value: string) => Comp
type MappingMap = Record<string, Comp>
type VTab = React.ReactElement<TabProps, typeof Tab>

export const VerticalTabPanel: React.FC<{
  children: VTab | ReadonlyArray<VTab>
  mapping: MappingFunc | MappingMap
  initialValue?: string
  onChange?: (value: string) => void
  sx?: SxProps
}> = ({ children, mapping, initialValue, onChange, sx }) => {
  const [value, setValue] = React.useState(initialValue || '')
  const Component = React.useMemo(
    () => (typeof mapping === 'function' ? mapping(value) : mapping[value]),
    [value]
  )

  return (
    <Stack direction="row" sx={sx} alignItems="stretch">
      <Tabs
        className="VerticalTabPanel_Tabs"
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={(_e, value) => {
          setValue(value)
          onChange && onChange(value)
        }}
        sx={{
          flexGrow: 0,
          flexShrink: 0,
          maxWidth: 200,
          '.MuiTabs-flexContainer': {
            minHeight: '100%'
          },
          '.MuiTab-root': {
            textTransform: 'none'
          }
        }}
      >
        {children}
      </Tabs>
      <React.Suspense fallback={<CenterProgress />}>
        {typeof Component === 'function' ? (
          <Component />
        ) : (
          Component || `Missing mapping for "${value}"`
        )}
      </React.Suspense>
    </Stack>
  )
}
