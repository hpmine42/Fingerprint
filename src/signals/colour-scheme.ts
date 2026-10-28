import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'colour-scheme', label: 'Colour scheme', category: 'Preferences',
  explanation: 'Whether the browser prefers light or dark colours.', trackerUse: 'A tracker can include operating-system appearance settings in a profile.', changesWhen: 'Changing the system appearance setting changes it.'
}

export const measure: SignalReader = () => readSignal(spec, () => matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
