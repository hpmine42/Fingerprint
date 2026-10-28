import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'first-day', label: 'First day of week', category: 'Locale & time',
  explanation: 'The first weekday implied by your locale, when supported.', trackerUse: 'A tracker can use regional formatting preferences as a signal.', changesWhen: 'Changing locale settings can change it.'
}

const read = () => {
  const locale = new Intl.Locale(navigator.language) as Intl.Locale & { getWeekInfo?: () => { firstDay: number } }
  if (!locale.getWeekInfo) throw new Error('This browser does not expose the locale week start.')
  return locale.getWeekInfo().firstDay
}
export const measure: SignalReader = () => readSignal(spec, read)
