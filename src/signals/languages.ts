import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'languages', label: 'Languages', category: 'Locale & time',
  explanation: 'The ordered language preferences the browser exposes.', trackerUse: 'A tracker can use language order to help distinguish browser profiles.', changesWhen: 'Changing browser language preferences changes this list.'
}

export const measure: SignalReader = () => readSignal(spec, () => Array.from(navigator.languages))
