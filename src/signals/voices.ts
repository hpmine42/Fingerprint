import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'voices', label: 'Speech voices', category: 'Hardware',
  explanation: 'The available speech synthesis voice count and first three names.', trackerUse: 'A tracker can use voice names as a less familiar browser signal.', changesWhen: 'Installing voices or changing operating system/browser can change it.'
}

const read = () => {
  if (!('speechSynthesis' in window)) throw new Error('This browser does not provide speech synthesis voices.')
  const voices = window.speechSynthesis.getVoices()
  return { count: voices.length, firstNames: voices.slice(0, 3).map((voice) => voice.name) }
}
export const measure: SignalReader = () => readSignal(spec, read)
