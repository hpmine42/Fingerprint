import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'platform', label: 'Platform', category: 'Hardware',
  explanation: 'The platform string the browser makes available.', trackerUse: 'A tracker can combine platform with GPU and rendering details.', changesWhen: 'An operating-system or browser change can change it.'
}

export const measure: SignalReader = () => readSignal(spec, () => navigator.platform)
