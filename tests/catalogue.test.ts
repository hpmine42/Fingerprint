import { describe, expect, it } from 'vitest'
import { catalogue, catalogueLabels } from '../src/signals/catalogue'

describe('signal catalogue', () => {
  it('keeps one progress label for every independently measured signal', () => {
    expect(catalogue).toHaveLength(28)
    expect(catalogueLabels).toHaveLength(catalogue.length)
  })
})
