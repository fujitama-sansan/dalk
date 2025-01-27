import { CheckBox, ContactMail, Extension, Newspaper, Speed, Storage } from '@mui/icons-material'
import { AppBar, Stack, Tab, Toolbar, Typography, styled } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import React from 'react'
import { AppSettingView } from './app/AppSettingView'
import { BizCardView } from './bizCard/BizCardView'
import { DbSettingAtom } from './dbSetting/DbSettingAtom'
import { DbSettingView } from './dbSetting/DbSettingView'
import { FeatureView } from './feature/FeatureView'
import { HelpView } from './help/HelpView'
import { IntegrationView } from './integration/IntegrationView'
import { NewsView } from './news/NewsView'
import { QuerySetView } from './querySet/QuerySetView'
import { SqsIcon } from './sqs/SqsIcon'
import { SqsView } from './sqs/SqsView'
import { CenterProgress } from './util/CenterProgress'
import { ConfirmDialog } from './util/ConfirmDialog'
import { VerticalTabPanel } from './util/VerticalTabPanel'

const selectedAppAtom = atomWithStorage<string>('app.selectedApp', 'bizCard', undefined, {
  getOnInit: true
})

const App: React.FC = () => {
  const dbSettings = useAtomValue(DbSettingAtom.listAtom)
  const mustBeDbSetting = dbSettings.items.length === 1 && dbSettings.items[0].name === ''
  const [selectedApp, setSelectedApp] = useAtom(selectedAppAtom)

  return (
    <>
      <Stack direction="column" justifyItems="stretch" sx={{ height: '100vh', width: '100%' }}>
        <React.Suspense fallback={<CenterProgress />}>
          <AppBar position="fixed">
            <Toolbar>
              <Typography variant="h6">DALK</Typography>
              <AppSettingView />
            </Toolbar>
          </AppBar>

          <VerticalTabPanel
            initialValue={mustBeDbSetting ? 'setting' : selectedApp}
            onChange={(value) => setSelectedApp(value)}
            mapping={{
              bizCard: BizCardView,
              setting: DbSettingView,
              news: NewsView,
              feature: FeatureView,
              sqs: SqsView,
              querySet: QuerySetView,
              integration: IntegrationView
            }}
            sx={{
              height: 'calc(100vh - var(--sz-globalbar-height))',
              mt: 'var(--sz-globalbar-height)',
              '>.VerticalTabPanel_Tabs': {
                backgroundColor: '#f0f0f0',
                borderRight: 1,
                borderColor: 'divider'
              }
            }}
          >
            <AppTab
              value="bizCard"
              icon={<ContactMail />}
              label="名刺"
              disabled={mustBeDbSetting}
            />
            <AppTab value="news" icon={<Newspaper />} label="ニュース" disabled={mustBeDbSetting} />
            <AppTab
              value="feature"
              icon={<CheckBox />}
              label="機能ON/OFF"
              disabled={mustBeDbSetting}
            />
            <AppTab
              value="integration"
              icon={<Extension />}
              label="外部連携"
              disabled={mustBeDbSetting}
            />
            <AppTab value="sqs" icon={<SqsIcon />} label="SQS" disabled={mustBeDbSetting} />
            <AppTab value="querySet" icon={<Speed />} label="クエリ" disabled={mustBeDbSetting} />
            <AppTab value="setting" icon={<Storage />} label="DB設定" sx={{ mt: 'auto' }} />
          </VerticalTabPanel>
        </React.Suspense>
      </Stack>
      <ConfirmDialog />
      <HelpView />
    </>
  )
}

const AppTab = styled(Tab)({
  p: 0,
  width: 80,
  img: {
    opacity: 0.2
  },
  '&.Mui-selected': {
    img: {
      opacity: 1
    }
  }
})

export default App
