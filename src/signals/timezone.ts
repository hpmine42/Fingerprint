import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'timezone', label: 'Time zone', category: 'Locale & time',
  explanation: 'The IANA time-zone name your browser reports.', trackerUse: 'A tracker can infer a broad region, not your exact location.', changesWhen: 'Changing the system time zone changes this value.'
}

export const measure: SignalReader = () => readSignal(spec, () => Intl.DateTimeFormat().resolvedOptions().timeZone)
