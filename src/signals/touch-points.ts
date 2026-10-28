import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'touch-points', label: 'Touch points', category: 'Hardware',
  explanation: 'The maximum number of simultaneous touch points reported.', trackerUse: 'A tracker can use this to help classify a device profile.', changesWhen: 'Using a different device or browser can change it.'
}

export const measure: SignalReader = () => readSignal(spec, () => navigator.maxTouchPoints)
