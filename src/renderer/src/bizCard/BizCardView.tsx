import { Tab } from '@mui/material'
import { MainLayout } from '../util/MainLayout'
import { VerticalTabPanel } from '../util/VerticalTabPanel'
import { BizCardListView } from './list/BizCardListView'
import { SuggestedMakerView } from './suggested/SuggestedMakerView'

export const BizCardView: React.FC = () => {
  return (
    <MainLayout title="名刺関連の操作" operatorNeeded={true}>
      <VerticalTabPanel
        initialValue="list"
        mapping={{
          list: BizCardListView,
          suggested: SuggestedMakerView
        }}
      >
        <Tab value="list" label="名刺" />
        <Tab value="suggested" label="名刺候補" />
      </VerticalTabPanel>
    </MainLayout>
  )
}
