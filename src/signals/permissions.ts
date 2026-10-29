import { readAsyncSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'permissions', label: 'Permission states', category: 'Storage',
  explanation: 'Permission states readable without requesting access; no prompt is opened.', trackerUse: 'A tracker can see current permission states, but this page never asks.', changesWhen: 'Changing a permission in browser settings can change it.'
}

const read = async () => {
  if (!navigator.permissions?.query) throw new Error('This browser does not expose permission states.')
  const names = ['camera', 'microphone', 'geolocation', 'notifications'] as const
  const results = await Promise.all(names.map(async (name) => {
    try { return [name, (await navigator.permissions.query({ name } as PermissionDescriptor)).state] as const }
    catch { return [name, 'not exposed by this browser'] as const }
  }))
  return Object.fromEntries(results)
}
export const measure: SignalReader = () => readAsyncSignal(spec, read)
