import type { Signal, SignalValue } from './signals/types'
import { normalizedSignals } from './core'

const STORAGE_KEY = 'fingerprint:last-visit:v1'
export interface SavedVisit {
  id: string
  values: Array<{ id: string; value: SignalValue }>
}

export function loadVisit(): SavedVisit | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed !== 'object' || parsed === null || !('id' in parsed) || !('values' in parsed)) return null
    const candidate = parsed as SavedVisit
    return typeof candidate.id === 'string' && Array.isArray(candidate.values) ? candidate : null
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

export function forgetVisit(): boolean {
  try { localStorage.removeItem(STORAGE_KEY); return true } catch { return false }
}

export { STORAGE_KEY }
