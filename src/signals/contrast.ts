import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'contrast', label: 'Contrast preference', category: 'Preferences',
  explanation: 'The browser contrast preference, when supported.', trackerUse: 'A tracker can add accessibility preferences to a profile.', changesWhen: 'Changing accessibility settings can change it.'
}

export const measure: SignalReader = () => readSignal(spec, () => (() => { if (matchMedia("(prefers-contrast: more)").matches) return "more"; if (matchMedia("(prefers-contrast: less)").matches) return "less"; if (matchMedia("(prefers-contrast: custom)").matches) return "custom"; if (matchMedia("(prefers-contrast: no-preference)").matches) return "no-preference"; throw new Error("This browser does not expose a contrast preference.") })())
