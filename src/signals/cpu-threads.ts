import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'cpu-threads', label: 'Logical processors', category: 'Hardware',
  explanation: 'The number of logical CPU threads reported to the page.', trackerUse: 'A tracker can use hardware capability as one part of a profile.', changesWhen: 'Different hardware or privacy settings can change it.'
}

export const measure: SignalReader = () => readSignal(spec, () => navigator.hardwareConcurrency)
