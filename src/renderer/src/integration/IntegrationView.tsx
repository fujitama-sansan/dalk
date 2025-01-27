import { Tab } from '@mui/material'
import React from 'react'
import { MainLayout } from '../util/MainLayout'
import { VerticalTabPanel } from '../util/VerticalTabPanel'
import { MSExchangeScheduleView } from './MSExchangeScheduleView'

export const IntegrationView: React.FC = () => {
  return (
    <MainLayout title="外部連携" operatorNeeded={true}>
      <VerticalTabPanel
        initialValue="msExchangeSchedule"
        mapping={{
          msExchangeSchedule: MSExchangeScheduleView
        }}
      >
        <Tab value="msExchangeSchedule" label="MS Exchange" />
      </VerticalTabPanel>
    </MainLayout>
  )
}
