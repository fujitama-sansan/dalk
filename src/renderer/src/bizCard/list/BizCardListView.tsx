import { Search } from '@mui/icons-material'
import { Box, Button, LinearProgress, Menu, MenuItem, Stack, TextField } from '@mui/material'
import { grey } from '@mui/material/colors'
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridToolbarContainer,
  gridClasses
} from '@mui/x-data-grid'
import { useAtom, useSetAtom } from 'jotai'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { BizCard, BizCardRegisterChannels, BizCardSearchQuery } from '../../../../common/interface'
import { HelpButton } from '../../help/HelpButton'
import { HelpContent } from '../../help/HelpContent'
import { BizCardListAtom } from './BizCardListAtom'
import { BizCardListHelp } from './BizCardListHelp'

const columns: GridColDef<BizCard>[] = [
  { field: 'bizCardId', headerName: 'BizCardId', width: 100 },
  {
    field: 'company-and-name',
    headerName: '会社名・氏名',
    width: 220,
    renderCell: (params): JSX.Element => {
      const bizCard = params.row
      return (
        <Stack direction="column">
          <Box>{bizCard.companyName}</Box>
          <Box>{bizCard.lastName + ' ' + bizCard.firstName}</Box>
        </Stack>
      )
    }
  },
  { field: 'email', headerName: 'メールアドレス', width: 180 }
]

export const BizCardListView: React.FC = () => {
  const [listState, dispatch] = useAtom(BizCardListAtom.atom)
  const [loading, setLoading] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<readonly string[]>([])
  const [detailId, setDetailId] = React.useState<string | null>(null)
  const detailBizCard = listState.bizCards.find((c) => c.bizCardId === detailId)
  const form = useForm<BizCardSearchQuery>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    values: listState.searchQuery
  })
  const { control, handleSubmit } = form
  return (
    <Stack direction="column" gap={2} className="main-scroll-pane" sx={{ px: 2, pt: 2 }}>
      <Stack
        direction="column"
        component="form"
        onSubmit={handleSubmit(async (data) => {
          setLoading(true)
          await dispatch(BizCardListAtom.Search(data))
          setLoading(false)
        })}
      >
        <Stack direction="row" gap={2} sx={{ height: 40 }}>
          <Controller
            control={control}
            name="query"
            render={({ field, formState: { errors } }) => (
              <TextField
                {...field}
                label="名前, メールアドレス"
                size="small"
                error={!!errors.query}
                helperText={errors.query?.message}
              />
            )}
          />
          <Button variant="contained" size="small" type="submit" endIcon={<Search />}>
            検索
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" sx={{ height: 'calc(100% - 64px)' }}>
        <DataGrid
          slots={{
            loadingOverlay: LinearProgress,
            toolbar: () => <BizCardListToolbar selectedIds={selectedIds} />
          }}
          onRowSelectionModelChange={(newSelectedIds) => {
            const lastId = newSelectedIds[newSelectedIds.length - 1] || null
            setDetailId(lastId as string)
            setSelectedIds(newSelectedIds as string[])
          }}
          paginationModel={listState.pagenationModel}
          onPaginationModelChange={(newModel) => {
            setLoading(true)
            dispatch(BizCardListAtom.ChangePagenationModel(newModel)).then(() => {
              setLoading(false)
            })
          }}
          rowSelectionModel={selectedIds as GridRowId[]}
          loading={loading}
          checkboxSelection
          rows={listState.bizCards}
          columns={columns}
          getRowId={(row: BizCard) => row.bizCardId}
          rowCount={listState.totalCount}
          sx={{
            [`& .${gridClasses.cell},.${gridClasses.columnHeader}`]: {
              '&:focus, &:focus-within': {
                outline: 'none'
              }
            },
            [`& .${gridClasses.columnHeaders}`]: {
              backgroundColor: grey[200],
              position: 'sticky',
              top: 0
            },
            height: '100%'
          }}
        />
        <Box sx={{ minWidth: 300, p: 2 }}>
          {detailBizCard && <BizCardDetailView bizCard={detailBizCard} />}
        </Box>
      </Stack>
    </Stack>
  )
}

const BizCardDetailView: React.FC<{
  bizCard: BizCard
}> = ({ bizCard }) => {
  return (
    <Stack direction="column" sx={{ position: 'sticky', top: 0 }}>
      {Object.entries(bizCard).map(([key, value], i) => (
        <Stack direction="row" gap={2} key={i}>
          <Box>{key}</Box>
          <Box>{show(value)}</Box>
        </Stack>
      ))}
    </Stack>
  )
}

const show = (value: string | number | Date | null): string => {
  if (value instanceof Date) {
    return value.toISOString()
  } else if (value === null) {
    return '(null)'
  } else {
    return String(value)
  }
}

const BizCardListToolbar: React.FC<{
  selectedIds: readonly string[]
}> = ({ selectedIds }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const dispatch = useSetAtom(BizCardListAtom.atom)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = (): void => {
    setAnchorEl(null)
  }

  return (
    <GridToolbarContainer>
      <Button
        variant="text"
        color="primary"
        onClick={handleClick}
        disabled={selectedIds.length === 0}
      >
        データ操作
      </Button>
      <Menu
        id="bizcard-list-context-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        <MenuItem
          onClick={() => {
            dispatch(BizCardListAtom.MakeUnread(selectedIds))
            handleClose()
          }}
        >
          読み取れなかった名刺にする
          <MenuHelp helpContent={BizCardListHelp.makeUnread} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            dispatch(BizCardListAtom.MakeNayosed(selectedIds))
            handleClose()
          }}
        >
          名寄せ済みにする
          <MenuHelp helpContent={BizCardListHelp.makeNayosed} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            dispatch(
              BizCardListAtom.ChangeRegisterChannel(
                selectedIds,
                BizCardRegisterChannels.SelfBizCardSource
              )
            )
            handleClose()
          }}
        >
          自己名刺ソースにする
          <MenuHelp helpContent={BizCardListHelp.makeSelfBizCardSource} />
        </MenuItem>
      </Menu>
    </GridToolbarContainer>
  )
}

const MenuHelp: React.FC<{ helpContent: HelpContent }> = ({ helpContent }) => {
  return (
    <Box sx={{ ml: 'auto', pl: 2 }}>
      <HelpButton helpContent={helpContent} />
    </Box>
  )
}
