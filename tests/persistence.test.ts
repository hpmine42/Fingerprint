import { afterEach, describe, expect, it, vi } from 'vitest'
import { forgetVisit, loadVisit, saveVisit, STORAGE_KEY } from '../src/persistence'
import type { Signal } from '../src/signals/types'

const testSignal: Signal = {
  id: 'screen',
  label: 'Screen size',
  category: 'Screen',
  value: { width: 1440, height: 900 },
  available: true,
  explanation: 'A test signal.',
  trackerUse: 'A tracker could combine it.',
  changesWhen: 'A display change can affect it.'
}

function memoryStorage(initial = new Map<string, string>()) {
  return {
    getItem: (key: string) => initial.get(key) ?? null,
    setItem: (key: string, value: string) => initial.set(key, value),
    removeItem: (key: string) => initial.delete(key)
  }
}

afterEach(() => vi.unstubAllGlobals())

describe('local receipt', () => {
  it('stores only the hash and normalized values required for a later comparison', () => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', memoryStorage(values))
    const id = 'a'.repeat(64)

    saveVisit(id, [testSignal])

    expect(loadVisit()).toEqual({
      id,
      values: [{ id: 'screen', value: { height: 900, width: 1440 } }]
    })
    expect([...values.keys()]).toEqual([STORAGE_KEY])
  })

  it('ignores a malformed or tampered saved receipt instead of breaking measurement', () => {
    const values = new Map([[STORAGE_KEY, JSON.stringify({ id: 'not-a-hash', values: [null] })]])
    vi.stubGlobal('localStorage', memoryStorage(values))
    expect(loadVisit()).toBeNull()

    values.set(STORAGE_KEY, JSON.stringify({ id: 'a'.repeat(64), values: [null] }))
    expect(loadVisit()).toBeNull()
    values.set(STORAGE_KEY, JSON.stringify({ id: 'a'.repeat(64), values: [] }))
    expect(loadVisit()).toBeNull()
  })

  it('reports whether the local receipt could be removed', () => {
    const values = new Map([[STORAGE_KEY, 'receipt']])
    vi.stubGlobal('localStorage', memoryStorage(values))
    expect(forgetVisit()).toBe('removed')
    expect(values.has(STORAGE_KEY)).toBe(false)
    expect(forgetVisit()).toBe('empty')

    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('Blocked') }, removeItem: () => { throw new Error('Blocked') } })
    expect(forgetVisit()).toBe('blocked')
  })
})
