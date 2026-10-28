import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'connection', label: 'Connection hints', category: 'Network-ish',
  explanation: 'The effective connection type and downlink estimate, when exposed.', trackerUse: 'A tracker can see these coarse hints; a VPN does not change the signals above.', changesWhen: 'Network conditions or browser support can change or hide these hints.'
}

const read = () => {
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } }).connection
  if (!connection) throw new Error('This browser does not expose connection hints.')
  return { effectiveType: connection.effectiveType ?? null, downlinkMbps: connection.downlink ?? null }
}
export const measure: SignalReader = () => readSignal(spec, read)
