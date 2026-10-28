import { describe, expect, it } from 'vitest'
import type { Signal } from '../src/signals/types'
import { diffSignals, fingerprint, normalizeValue, serializeSignals } from '../src/core'
import { readSignal } from '../src/signals/read'

function signal(id: string, value: Signal['value'], available = true): Signal {
  return {
    id, label: id, category: 'Test', value, available,
    explanation: 'A test signal.', trackerUse: 'A tracker could combine it.', changesWhen: 'A setting changes it.'
  }
}

describe('deterministic fingerprint core', () => {
  it('produces the same hash for identical signal inputs', async () => {
    const input = [signal('screen', { width: 1440, height: 900 }), signal('locale', ['en', 'de'])]
    expect(await fingerprint(input)).toBe(await fingerprint(input))
  })

  it('changes the hash when exactly one signal changes', async () => {
    const before = [signal('screen', { width: 1440, height: 900 }), signal('locale', 'en')]
    const after = [signal('screen', { width: 1440, height: 900 }), signal('locale', 'de')]
    expect(await fingerprint(before)).not.toBe(await fingerprint(after))
  })

  it('normalizes arrays independently of order and never serializes undefined', () => {
    expect(normalizeValue([' beta ', 'alpha'])).toEqual(normalizeValue(['alpha', 'beta']))
    const normalized = serializeSignals([signal('missing', undefined as unknown as Signal['value'])])
    expect(normalized).not.toContain('undefined')
    expect(normalized).toContain('null')
  })

  it('reports exactly the changed rows in a before and after receipt', () => {
    const before = [signal('a', 'one'), signal('b', 2), signal('c', ['x', 'y'])]
    const after = [signal('a', 'one'), signal('b', 3), signal('c', ['x', 'z'])]
    expect(diffSignals(before, after).map((change) => change.id)).toEqual(['b', 'c'])
  })

  it('normalizes unavailable errors without allowing the error wording to change the ID', async () => {
    const first = await readSignal({ id: 'hidden', label: 'Hidden', category: 'Test', explanation: '', trackerUse: '', changesWhen: '' }, () => { throw new Error('Denied for reason A') })
    const second = await readSignal({ id: 'hidden', label: 'Hidden', category: 'Test', explanation: '', trackerUse: '', changesWhen: '' }, () => { throw new Error('Denied for reason B') })
    expect(first.available).toBe(false)
    expect(first.reason).toContain('Denied for reason A')
    expect(await fingerprint([first])).toBe(await fingerprint([second]))
  })
})
