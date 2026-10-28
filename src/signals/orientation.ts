import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'orientation', label: 'Screen orientation', category: 'Screen',
  explanation: 'The screen orientation type and angle, when exposed.', trackerUse: 'A tracker can combine orientation with screen dimensions.', changesWhen: 'Rotating a device changes it.'
}

export const measure: SignalReader = () => readSignal(spec, () => ({ type: screen.orientation.type, angle: screen.orientation.angle }))
