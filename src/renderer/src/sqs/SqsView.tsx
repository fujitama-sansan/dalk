import { Delete } from '@mui/icons-material'
import { Box, Button, Stack, Tab, Tabs } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import React from 'react'
import { CenterProgress } from '../util/CenterProgress'
import { useConfirmDialog } from '../util/ConfirmDialog'
import { MainLayout } from '../util/MainLayout'
import { SqsForm } from './SqsForm'
import { SqsViewHelp } from './SqsViewHelp'
import { SqsMessageDefinitionListAtom } from './atom/SqsMessageDefinitionListAtom'

export const SqsView: React.FC = () => {
  const [definitions, dispatch] = useAtom(SqsMessageDefinitionListAtom.atom)
  const [selectedId, select] = useAtom(SqsMessageDefinitionListAtom.selectionAtom)
  const selectable = useAtomValue(SqsMessageDefinitionListAtom.selectableAtom)
  const confirm = useConfirmDialog()

  return (
    <MainLayout title="SQS (lk-dev)" helpContent={SqsViewHelp.main}>
      <Stack direction="row" alignItems="stretch">
        <Stack
          direction="column"
          sx={{ borderRight: 1, borderColor: 'divider' }}
          alignItems="stretch"
        >
          <Stack direction="column" alignItems="stretch" sx={{ height: 60, mx: 1 }}>
            <Button
              variant="outlined"
              onClick={() => {
                dispatch(SqsMessageDefinitionListAtom.Create())
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
            value={selectedId || definitions.items[0]?.id || null}
            sx={{
              overflowY: 'auto',
              height: 'calc(var(--sz-main-height) - 60px)',
              maxWidth: 200,
              '.MuiTab-root': {
                textTransform: 'none'
              },
              alignItems: 'stretch'
            }}
            onChange={(_e, value) => {
              select(value)
            }}
          >
            {definitions.items.map((item) => (
              <Tab
                key={item.id}
                disabled={!selectable && selectedId !== item.id}
                label={item.name}
                value={item.id}
                sx={{ minHeight: 42, pr: 5 }}
                icon={
                  selectable || selectedId === item.id ? (
                    <Box
                      onMouseDown={(e) => {
                        e.stopPropagation()
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        confirm({
                          title: '削除の確認',
                          message: `SQSメッセージ「${item.name || '（未設定）'}」を削除しますか？`,
                          onOk: async () => {
                            await dispatch(SqsMessageDefinitionListAtom.Remove(item.id))
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
        <React.Suspense fallback={<CenterProgress />}>
          {selectedId ? <SqsForm id={selectedId} /> : <Box />}
        </React.Suspense>
      </Stack>
    </MainLayout>
  )
}
