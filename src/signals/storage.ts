import { readAsyncSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'storage', label: 'Storage estimate', category: 'Storage',
  explanation: 'The browser’s approximate storage quota and current usage, without writing anything.', trackerUse: 'A tracker can use quota differences as a stable browser signal.', changesWhen: 'Browser profile, device capacity, or storage policy can affect it.'
}

const read = async () => {
  if (!navigator.storage?.estimate) throw new Error('This browser does not expose a storage estimate.')
  const estimate = await navigator.storage.estimate()
  return { quotaBytes: estimate.quota ?? null }
}
export const measure: SignalReader = () => readAsyncSignal(spec, read)
