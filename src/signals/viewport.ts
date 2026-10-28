import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'viewport', label: 'Viewport', category: 'Screen',
  explanation: 'The current page area available to web content.', trackerUse: 'A tracker can use viewport dimensions to distinguish browser setups.', changesWhen: 'Resizing the window or changing zoom changes it.'
}

export const measure: SignalReader = () => readSignal(spec, () => ({ width: window.innerWidth, height: window.innerHeight }))
