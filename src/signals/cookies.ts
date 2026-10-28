import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'cookies', label: 'Cookies enabled', category: 'Storage',
  explanation: 'Whether the browser reports cookies as enabled. This page does not set one.', trackerUse: 'A tracker can treat this as a capability flag; this page sets no cookies.', changesWhen: 'Changing browser privacy settings can change it.'
}

export const measure: SignalReader = () => readSignal(spec, () => navigator.cookieEnabled)
