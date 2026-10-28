import { afterEach, describe, expect, it, vi } from 'vitest'
import { measure } from '../src/signals/fonts'

afterEach(() => vi.unstubAllGlobals())

describe('font signal', () => {
  it('detects a stubbed installed candidate and excludes generic fallback names', async () => {
    const context = {
      font: '',
      measureText: (text: string) => ({ width: /Arial/.test(context.font) ? text.length * 72 + 7 : text.length * 72 })
    }
    const fakeDocument = { createElement: () => ({ getContext: () => context }) }
    vi.stubGlobal('document', fakeDocument)
    const result = await measure()
    expect(result.available).toBe(true)
    expect(result.value).toContain('Arial')
    expect(result.value).not.toContain('serif')
    expect(result.value).not.toContain('sans-serif')
    expect(result.value).not.toContain('monospace')
  })
})
