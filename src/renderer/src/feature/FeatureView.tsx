import { HighlightOff, PauseCircle, RunCircle } from '@mui/icons-material'
import { Box, Chip, Switch, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { grey } from '@mui/material/colors'
import { useAtom } from 'jotai'
import React from 'react'
import { MainLayout } from '../util/MainLayout'
import { FeatureAtom, FeatureState } from './FeatureAtom'
import { FeatureHelp } from './FeatureHelp'

export const FeatureView: React.FC = () => {
  return (
    <MainLayout title="機能ON/OFF" operatorNeeded={true} helpContent={FeatureHelp.help}>
      <Box className="main-scroll-pane">
        <FeatureListView />
      </Box>
    </MainLayout>
  )
}

const isAvailable = (feature: FeatureState): boolean =>
  feature.commonAvailable || feature.mstAvailable

const isActivated = (feature: FeatureState): boolean =>
  feature.commonActivated || feature.mstActivated

const FeatureListView: React.FC = () => {
  const [features, dispatch] = useAtom(FeatureAtom.atom)
  return (
    <Table>
      <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: grey[200], zIndex: 1 }}>
        <TableRow>
          <TableCell component="th" colSpan={2}>
            Feature
          </TableCell>
          <TableCell component="th">Available</TableCell>
          <TableCell component="th">Activated</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {features.map((feature, idx) => (
          <TableRow key={idx}>
            <TableCell>
              {feature.label}
              <br />
              {feature.name}
            </TableCell>
            <TableCell sx={{ textAlign: 'center' }}>
              <StatusView feature={feature} />
            </TableCell>
            <TableCell>
              <Switch
                disabled={feature.commonAvailable}
                checked={isAvailable(feature)}
                onChange={(e) => {
                  dispatch(FeatureAtom.ChangeAvailability(feature.name, e.target.checked))
                }}
              />
            </TableCell>
            <TableCell>
              <Switch
                disabled={feature.commonActivated}
                checked={isActivated(feature)}
                onChange={(e) => {
                  dispatch(FeatureAtom.ChangeActivation(feature.name, e.target.checked))
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const StatusView: React.FC<{
  feature: FeatureState
}> = ({ feature }) => {
  if (isAvailable(feature)) {
    if (isActivated(feature)) {
      return <Chip label="有効" icon={<RunCircle />} color="success" sx={{ mx: 'auto' }} />
    } else {
      return <Chip label="一時停止" icon={<PauseCircle />} color="default" />
    }
  } else {
    return <Chip label="無効" icon={<HighlightOff />} color="default" />
  }
}
