import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'screen-size', label: 'Screen size', category: 'Screen',
  explanation: 'Your physical screen dimensions in CSS pixels.', trackerUse: 'A tracker can use screen dimensions as part of a browser profile.', changesWhen: 'Changing display or resolution can change this value.'
}

export const measure: SignalReader = () => readSignal(spec, () => ({ width: screen.width, height: screen.height }))
