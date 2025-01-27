import {
  Box,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { BarChart } from '@mui/x-charts'
import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { BackendEventConst } from '../../../common/interface'
import { BackendAtom } from '../ipc/BackendAtom'
import {
  QueryExecutionAtom,
  QueryExecutionInprogressState,
  QueryExecutionSuccessState
} from './atom/QueryExecutionAtom'

export const QueryExecutionResultView: React.FC<{ definitionId: string }> = ({ definitionId }) => {
  const [state, dispatch] = useAtom(QueryExecutionAtom.resultAtom(definitionId))
  const eventApi = useAtomValue(BackendAtom.eventApiAtom)
  React.useEffect(() => {
    eventApi.listen(BackendEventConst.types.QueryExecution, (event) => {
      dispatch(QueryExecutionAtom.OnEvent(event))
    })
    return () => {
      eventApi.release(BackendEventConst.types.QueryExecution)
    }
  }, [eventApi, dispatch])

  if (state.state === 'Init') {
    return <></>
  } else {
    return (
      <Box
        sx={{
          borderTop: '1px solid gray'
        }}
      >
        {state.state === 'InProgress' && <InProgressView state={state} />}
        {state.state === 'Success' && <SuccessView state={state} />}
      </Box>
    )
  }
}

export const InProgressView: React.FC<{ state: QueryExecutionInprogressState }> = ({ state }) => {
  return (
    <>
      <LinearProgress
        variant="determinate"
        value={(100.0 * state.successCount) / state.totalCompanyCount}
      />
      {state.successCount} / {state.totalCompanyCount} [ {state.recentUcompanyId} ]
    </>
  )
}

export const SuccessView: React.FC<{ state: QueryExecutionSuccessState }> = ({ state }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <Th>企業数</Th>
            <Th>成功</Th>
            <Th>失敗</Th>
            <Th>平均(ms)</Th>
            <Th>最大(ms)</Th>
            <Th>99%(ms)</Th>
            <Th>95%(ms)</Th>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <Td>{state.statistics.totalCount}</Td>
            <Td>{state.statistics.successCount}</Td>
            <Td>{state.statistics.errorCount}</Td>
            <Td>{state.statistics.average}</Td>
            <Td>{state.statistics.maximum}</Td>
            <Td>{state.statistics.percentile99}</Td>
            <Td>{state.statistics.percentile95}</Td>
          </TableRow>
        </TableBody>
      </Table>
      <BarChart
        layout="vertical"
        dataset={state.chartData}
        xAxis={[
          {
            label: 'ucompanyId',
            dataKey: 'ucompanyId',
            scaleType: 'band'
          }
        ]}
        yAxis={[
          {
            label: 'time (ms)'
          }
        ]}
        series={[
          {
            dataKey: 'time'
          }
        ]}
        height={200}
      />
    </TableContainer>
  )
}

const Th: React.FC<TableCellProps> = ({ children, ...props }) => {
  return (
    <TableCell {...props} size="small" sx={{ fontWeight: 'bold' }} align="center">
      {children}
    </TableCell>
  )
}

const Td: React.FC<TableCellProps> = ({ children, ...props }) => {
  return (
    <TableCell {...props} size="small" align="center">
      {children}
    </TableCell>
  )
}
