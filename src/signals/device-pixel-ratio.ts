import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'device-pixel-ratio', label: 'Device pixel ratio', category: 'Screen',
  explanation: 'The ratio between physical pixels and CSS pixels.', trackerUse: 'A tracker combines this with screen and rendering details.', changesWhen: 'Display scaling or zoom can affect it.'
}

export const measure: SignalReader = () => readSignal(spec, () => window.devicePixelRatio)
