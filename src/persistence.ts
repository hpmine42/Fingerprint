import type { Signal, SignalValue } from './signals/types'
import { normalizedSignals } from './core'

const STORAGE_KEY = 'fingerprint:last-visit:v1'
export interface SavedVisit {
  id: string
  values: Array<{ id: string; value: SignalValue }>
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isSignalValue(value: unknown): value is SignalValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every(isSignalValue)
  return isPlainRecord(value) && Object.values(value).every(isSignalValue)
}

function isSavedVisit(value: unknown): value is SavedVisit {
  if (!isPlainRecord(value) || typeof value.id !== 'string' || !/^[0-9a-f]{64}$/.test(value.id)) return false
  if (!Array.isArray(value.values) || value.values.length === 0) return false
  const ids = new Set<string>()
  return value.values.every((entry) => {
    if (!isPlainRecord(entry) || typeof entry.id !== 'string' || entry.id.length === 0 || !isSignalValue(entry.value)) return false
    if (ids.has(entry.id)) return false
    ids.add(entry.id)
    return true
  })
}

export function loadVisit(): SavedVisit | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    return isSavedVisit(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveVisit(id: string, signals: Signal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, values: normalizedSignals(signals) } satisfies SavedVisit))
  } catch {
    // Private browsing or storage policy can prevent this optional local receipt.
  }
}

export type ForgetResult = 'removed' | 'empty' | 'blocked'

export function forgetVisit(): ForgetResult {
  try {
    const hadReceipt = localStorage.getItem(STORAGE_KEY) !== null
    localStorage.removeItem(STORAGE_KEY)
    return hadReceipt ? 'removed' : 'empty'
  } catch {
    return 'blocked'
  }
}

export { STORAGE_KEY }
