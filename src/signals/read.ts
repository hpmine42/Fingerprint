import type { Signal, SignalValue } from './types'

type SignalSpec = Pick<Signal, 'id' | 'label' | 'category' | 'explanation' | 'trackerUse' | 'changesWhen'>

export async function readSignal(spec: SignalSpec, read: () => unknown): Promise<Signal> {
  try {
    const value = read()
    if (value === undefined) throw new Error('This browser does not expose this value.')
    return { ...spec, value: value as SignalValue, available: true }
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : 'This browser does not expose this value.'
    return { ...spec, value: null, available: false, reason: message }
  }
}

export async function readAsyncSignal(spec: SignalSpec, read: () => Promise<unknown>): Promise<Signal> {
  try {
    const value = await read()
    if (value === undefined) throw new Error('This browser does not expose this value.')
    return { ...spec, value: value as SignalValue, available: true }
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : 'This browser does not expose this value.'
    return { ...spec, value: null, available: false, reason: message }
  }
}

export async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
