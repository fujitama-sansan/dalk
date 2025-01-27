import { ContentCopy, Delete, Menu as MenuIcon } from '@mui/icons-material'

import {
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs
} from '@mui/material'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import React from 'react'
import { QuerySetDefinition } from 'src/common/interface'
import { useConfirmDialog } from '../util/ConfirmDialog'
import { MainLayout } from '../util/MainLayout'
import { QuerySetForm } from './QuerySetForm'
import { SQLViewHelp } from './QuerySetViewHelp'
import { QuerySetDefinitionAtom } from './atom/QuerySetDefinitionAtom'

export const QuerySetView: React.FC = () => {
  const [list, dispatch] = useAtom(QuerySetDefinitionAtom.listAtom)
  const [_selectedId, select] = useAtom(QuerySetDefinitionAtom.selectionAtom)
  // listの中に_selectedIdがなければ最初のidを選択する
  const selectedId = list.items.find((item) => item.id === _selectedId)
    ? _selectedId
    : list.items[0]?.id

  const selectable = useAtomValue(QuerySetDefinitionAtom.selectableAtom)
  const allowRemove = list.items.length > 1
  return (
    <MainLayout title="クエリの実行速度計測" helpContent={SQLViewHelp.main}>
      <Stack direction="row" alignItems="stretch">
        <Stack
          direction="column"
          sx={{
            borderRight: 1,
            borderColor: 'divider'
          }}
          alignItems="stretch"
        >
          <Stack direction="column" alignItems="stretch" sx={{ height: 60, mx: 1 }}>
            <Button
              variant="outlined"
              onClick={() => {
                dispatch(QuerySetDefinitionAtom.Create())
              }}
              disabled={!selectable}
              sx={{ minWidth: 120 }}
            >
              新規作成
            </Button>
          </Stack>

          <Tabs
            variant="scrollable"
            orientation="vertical"
            value={selectedId}
            onChange={(_e, value) => {
              select(value)
            }}
            sx={{
              overflowY: 'auto',
              height: 'calc(var(--sz-main-height) - 60px)',
              maxWidth: 200,
              '.MuiTab-root': {
                textTransform: 'none'
              },
              alignItems: 'stretch'
            }}
          >
            {list.items.map((item) => (
              <Tab
                key={item.id}
                disabled={!selectable && selectedId !== item.id}
                value={item.id}
                label={item.name}
                sx={{ minHeight: 42, pr: allowRemove ? 5 : 2 }}
                icon={<ItemMenu item={item} allowRemove={allowRemove} />}
                iconPosition="end"
              />
            ))}
          </Tabs>
        </Stack>
        {selectedId ? <QuerySetForm id={selectedId} /> : <Box />}
      </Stack>
    </MainLayout>
  )
}

// ...ボタンをクリックすると、「削除」と「複製」のドロップダウンメニューを表示する。
const ItemMenu: React.FC<{
  item: QuerySetDefinition
  allowRemove: boolean
}> = ({ item, allowRemove }) => {
  const dispatch = useSetAtom(QuerySetDefinitionAtom.listAtom)
  const confirm = useConfirmDialog()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }
  const handleClose = (): void => {
    setAnchorEl(null)
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        right: 8,
        cursor: 'pointer',
        ':hover': {
          color: 'error.main'
        },
        p: '12px 3px',
        mr: -0.5
      }}
    >
      <IconButton onClick={handleClick} size="small">
        <MenuIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            handleClose()
            confirm({
              title: '削除の確認',
              message: `クエリ定義「${item.name || '（未設定）'}」を削除しますか？`,
              onOk: async () => {
                await dispatch(QuerySetDefinitionAtom.Remove(item.id))
              }
            })
          }}
          disabled={!allowRemove}
        >
          <ListItemIcon>
            <Delete sx={{ m: 0, width: 16, height: 16 }} />
          </ListItemIcon>
          <ListItemText>削除</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            handleClose()
            dispatch(QuerySetDefinitionAtom.Duplicate(item.id))
          }}
        >
          <ListItemIcon>
            <ContentCopy sx={{ m: 0, width: 16, height: 16 }} />
          </ListItemIcon>
          <ListItemText>複製</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}
