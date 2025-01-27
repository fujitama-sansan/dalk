import { atom } from 'jotai'
import { HelpContent } from './HelpContent'

const mainAtom = atom<HelpContent | null>(null)

export const HelpAtom = {
  atom: mainAtom
} as const
