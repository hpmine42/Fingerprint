import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'device-memory', label: 'Device memory', category: 'Hardware',
  explanation: 'An approximate device-memory value, only on browsers that expose it.', trackerUse: 'A tracker can use the reported memory bucket as a hardware signal.', changesWhen: 'Hardware changes it; some browsers deliberately omit it.'
}

export const measure: SignalReader = () => readSignal(spec, () => (navigator as Navigator & { deviceMemory?: number }).deviceMemory)
