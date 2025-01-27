import { Delete } from '@mui/icons-material'
import { Box, Button, Stack, Tab, Tabs } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { AppSettingAtom } from '../app/AppSettingAtom'
import { useConfirmDialog } from '../util/ConfirmDialog'
import { MainLayout } from '../util/MainLayout'
import { DbSettingAtom } from './DbSettingAtom'
import { DbSettingForm } from './DbSettingForm'

export const DbSettingView: React.FC = () => {
  const setting = useAtomValue(AppSettingAtom.atom)
  const [dbSettingList, dispatchDbSetting] = useAtom(DbSettingAtom.listAtom)
  const selectable = useAtomValue(DbSettingAtom.selectableAtom)
  const [selectedId, select] = React.useState(
    dbSettingList.items.find((item) => item.id === setting.data.dbSettingId)?.id ||
      dbSettingList.items[0].id
  )
  if (!dbSettingList.items.find((item) => item.id === selectedId)) {
    throw new Promise<void>((resolve) => {
      if (dbSettingList.items.find((item) => item.id === selectedId)) {
        resolve()
      }
    })
  }
  const confirm = useConfirmDialog()
  const allowRemove = dbSettingList.items.length > 1
  return (
    <MainLayout title="接続先DBの設定">
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
                dispatchDbSetting(
                  DbSettingAtom.Create((newId) => {
                    select(newId)
                  })
                )
              }}
              disabled={!selectable}
              sx={{ minWidth: 120 }}
            >
              新規作成
            </Button>
          </Stack>

          <Tabs
            className=""
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
            {dbSettingList.items.map((item, idx) => (
              <Tab
                disabled={!selectable && selectedId !== item.id}
                key={idx}
                label={item.name || '（未設定）'}
                value={item.id}
                sx={{ minHeight: 42, pr: allowRemove ? 5 : 2 }}
                icon={
                  allowRemove ? (
                    <Box
                      onMouseDown={(e) => {
                        e.stopPropagation()
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        confirm({
                          title: '削除の確認',
                          message: `DB設定「${item.name || '（未設定）'}」を削除しますか？`,
                          onOk: () => {
                            dispatchDbSetting(DbSettingAtom.Remove(item.id)).then(() => {
                              if (selectedId === item.id) {
                                const nextIdx = idx === 0 ? idx + 1 : idx - 1
                                select(dbSettingList.items[nextIdx].id)
                              }
                            })
                          }
                        })
                      }}
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
                      <Delete sx={{ m: 0, width: 16, height: 16 }} />
                    </Box>
                  ) : undefined
                }
                iconPosition="end"
              />
            ))}
          </Tabs>
        </Stack>
        <DbSettingForm dbSettingId={selectedId} />
      </Stack>
    </MainLayout>
  )
}
