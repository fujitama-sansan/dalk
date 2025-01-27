import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { useAtom } from 'jotai'
import React from 'react'
import { HelpButton } from '../help/HelpButton'
import { MSExchangeIntegrationAtom } from './MSExchangeIntegrationAtom'

export const MSExchangeScheduleView: React.FC = () => {
  const [info, dispatch] = useAtom(MSExchangeIntegrationAtom.atom)
  return (
    <Stack direction="column" gap={2} className="main-scroll-pane" sx={{ px: 2, pt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell component="th">情報</TableCell>
            <TableCell component="th">設定値</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {info ? (
            <>
              <TableRow>
                <TableCell component="th">MSExchange Credential ID</TableCell>
                <TableCell>{info?.credential.credentialId}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">MSExchange Tenant ID</TableCell>
                <TableCell>{info?.credential.tenantId}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">Fetch Status</TableCell>
                <TableCell>
                  <FetchStatusView fetchStatus={info?.fetchSchedule.fetchStatus} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">Last Fetch Timestamp</TableCell>
                <TableCell>
                  <DateTimePicker
                    label="Last fetch timestamp"
                    value={dayjs(info?.fetchSchedule.lastFetchTimestamp)}
                    onChange={(newValue) =>
                      dispatch(
                        MSExchangeIntegrationAtom.ChangeLastFetchTimestamp(
                          newValue?.toDate() || null
                        )
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            </>
          ) : (
            <>
              <TableRow>
                <TableCell colSpan={2}>レコードが存在しません</TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </Stack>
  )
}

const FetchStatusView: React.FC<{ fetchStatus: number | undefined | null }> = ({ fetchStatus }) => {
  return (
    <Stack direction="row" gap={2}>
      <Box>{fetchStatusLabel(fetchStatus)}</Box>
      <HelpButton
        sx={{ my: -2 }}
        helpContent={{
          title: 'Fetch Status',
          description: `Fetch Statusの説明`
        }}
      />
    </Stack>
  )
}

const fetchStatusLabel = (fetchStatus: number | undefined | null): string => {
  switch (fetchStatus) {
    case null:
    case undefined:
    case 0:
      return '連携中'
    case 1:
      return '未連携'
    case 2:
      return '連携失敗'
    case 3:
      return '認証失敗'
    case 4:
      return '権限なし'
    default:
      throw new Error(`unknown status: ${fetchStatus}`)
  }
}
