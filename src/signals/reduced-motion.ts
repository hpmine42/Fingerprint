import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'reduced-motion', label: 'Reduced motion', category: 'Preferences',
  explanation: 'Whether the browser requests fewer motion effects.', trackerUse: 'A tracker can add accessibility preferences to a profile.', changesWhen: 'Changing the system accessibility setting changes it.'
}

export const measure: SignalReader = () => readSignal(spec, () => matchMedia("(prefers-reduced-motion: reduce)").matches)
