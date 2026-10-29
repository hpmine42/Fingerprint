import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'voices', label: 'Speech voices', category: 'Hardware',
  explanation: 'The voices returned at this check and up to their first three names. An empty list means none were returned at that moment; no speech is played.', trackerUse: 'A tracker can use voice names as a less familiar browser signal.', changesWhen: 'Installing voices or changing operating system/browser can change it.'
}

const read = () => {
  if (!('speechSynthesis' in window)) throw new Error('This browser does not provide speech synthesis voices.')
  const voices = window.speechSynthesis.getVoices()
  return { count: voices.length, firstNames: voices.slice(0, 3).map((voice) => voice.name) }
}
export const measure: SignalReader = () => readSignal(spec, read)
