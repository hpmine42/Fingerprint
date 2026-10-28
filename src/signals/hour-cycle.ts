import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'hour-cycle', label: 'Hour cycle', category: 'Locale & time',
  explanation: 'Whether your locale formats time on a 12-hour or 24-hour clock.', trackerUse: 'A tracker can combine formatting conventions with language settings.', changesWhen: 'Changing locale settings changes it.'
}

export const measure: SignalReader = () => readSignal(spec, () => new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hourCycle)
