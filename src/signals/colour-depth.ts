import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'colour-depth', label: 'Colour depth', category: 'Screen',
  explanation: 'The screen colour depth reported to pages.', trackerUse: 'A tracker can add this to other display signals.', changesWhen: 'A different display or system setting can change it.'
}

export const measure: SignalReader = () => readSignal(spec, () => screen.colorDepth)
