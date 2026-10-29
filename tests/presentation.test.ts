import { describe, expect, it } from 'vitest'
import { compactDisplayValue } from '../src/presentation'

describe('compact signal values', () => {
  it('leaves short values untouched and truncates long values visibly', () => {
    expect(compactDisplayValue('1920 × 1080')).toBe('1920 × 1080')
    expect(compactDisplayValue('a'.repeat(12), 8)).toBe('aaaaaaa…')
  })

  it('does not split a Unicode character at the preview boundary', () => {
    expect(compactDisplayValue('a😀b', 2)).toBe('a…')
  })
})
