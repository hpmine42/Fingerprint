import type { Signal, SignalValue } from './signals/types'
import { sha256 } from './signals/read'

export function normalizeValue(value: unknown): SignalValue {
  if (value === undefined || value === null) return null
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return Number.isFinite(value) ? Number(value.toFixed(4)) : null
  if (typeof value === 'boolean') return value
  if (Array.isArray(value)) {
    return value.map(normalizeValue).sort((left, right) => {
      const leftJson = JSON.stringify(left)
      const rightJson = JSON.stringify(right)
      return leftJson < rightJson ? -1 : leftJson > rightJson ? 1 : 0
    })
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return Object.fromEntries(Object.keys(record).sort().map((key) => [key, normalizeValue(record[key])]))
  }
  return String(value).trim()
}

export function normalizedSignals(signals: Signal[]): Array<{ id: string; value: SignalValue }> {
  return signals.map((signal) => ({
    id: signal.id,
    value: signal.available ? normalizeValue(signal.value) : { unavailable: true }
  }))
}

export function serializeSignals(signals: Signal[]): string {
  return JSON.stringify(normalizedSignals(signals))
}

export async function fingerprint(signals: Signal[]): Promise<string> {
  return sha256(serializeSignals(signals))
}

export function stabilityBySignal(runs: Signal[][]): Record<string, boolean> {
  const latest = runs[runs.length - 1] ?? []
  return Object.fromEntries(latest.map((signal) => [
    signal.id,
    runs.length > 0 && runs.every((run) => {
      const other = run.find((item) => item.id === signal.id)
      if (!other) return false
      const otherValue = other.available ? other.value : { unavailable: true }
      const latestValue = signal.available ? signal.value : { unavailable: true }
      return JSON.stringify(normalizeValue(otherValue)) === JSON.stringify(normalizeValue(latestValue))
    })
  ]))
}

export interface SignalChange {
  id: string
  label: string
  before: SignalValue
  after: SignalValue
}

export function diffSignals(before: Signal[], after: Signal[]): SignalChange[] {
  const previous = new Map(normalizedSignals(before).map((item) => [item.id, item.value]))
  return after.flatMap((signal) => {
    const prior = previous.get(signal.id)
    const current = normalizedSignals([signal])[0]?.value
    if (prior === undefined && !previous.has(signal.id)) return []
    if (JSON.stringify(prior) === JSON.stringify(current)) return []
    const beforeSignal = before.find((item) => item.id === signal.id)
    return [{ id: signal.id, label: signal.label, before: beforeSignal?.available ? normalizeValue(beforeSignal.value) : { unavailable: true }, after: current ?? null }]
  })
}
