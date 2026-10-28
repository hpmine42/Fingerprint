import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'utc-offset', label: 'UTC offset & DST', category: 'Locale & time',
  explanation: 'The current UTC offset and whether the offset differs across this year.', trackerUse: 'A tracker can combine time-zone behaviour with locale signals.', changesWhen: 'Travel or changing the system time zone can change it.'
}

export const measure: SignalReader = () => readSignal(spec, () => (() => { const now = new Date(); const offsetMinutes = -now.getTimezoneOffset(); const offsets = Array.from({ length: 12 }, (_, month) => new Date(now.getFullYear(), month, 1).getTimezoneOffset()); return { offsetMinutes, dstObservedThisYear: new Set(offsets).size > 1 } })())
