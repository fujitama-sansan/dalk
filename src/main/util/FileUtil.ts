import path from 'path'

const HOME_DIR = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] || ''
if (!HOME_DIR) {
  throw new Error('HOME not found')
}

const dalkPath = (fileName: string): string => path.join(HOME_DIR, '.dalk', fileName)

const dalkUrl = (fileName: string): string => `file:${dalkPath(fileName).replace(/\\/g, '/')}`

export const FileUtil = {
  dalkPath,
  dalkUrl
} as const
