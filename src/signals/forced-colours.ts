import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'forced-colours', label: 'Forced colours', category: 'Preferences',
  explanation: 'Whether the browser is using a forced-colours mode.', trackerUse: 'A tracker can include accessibility and display configuration in a profile.', changesWhen: 'Changing system accessibility settings can change it.'
}

export const measure: SignalReader = () => readSignal(spec, () => matchMedia("(forced-colors: active)").matches)
