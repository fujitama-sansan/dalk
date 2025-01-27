import { Box, Drawer } from '@mui/material'
import { grey } from '@mui/material/colors'
import { useAtom } from 'jotai'
import React from 'react'
import Markdown from 'react-markdown'
import rehypeExternalLinks from 'rehype-external-links'
import remarkGfm from 'remark-gfm'
import { HelpAtom } from './HelpAtom'

export const HelpView: React.FC = () => {
  const [helpContent, setHelpContent] = useAtom(HelpAtom.atom)
  const open = !!helpContent
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => setHelpContent(null)}
      sx={{
        zIndex: 1600
      }}
    >
      {helpContent && (
        <Box
          sx={{
            width: '30vw',
            minWidth: 240,
            maxWidth: '35vw',
            p: 2,
            color: grey[700],
            fontSize: '90%'
          }}
        >
          <h2>{helpContent.title}</h2>
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
          >
            {helpContent.description}
          </Markdown>
        </Box>
      )}
    </Drawer>
  )
}
