import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

describe('GitHub Pages path', () => {
  it('uses the repository’s lowercase path consistently for Vite, the manifest, and the favicon', async () => {
    const [viteConfig, html] = await Promise.all([
      readFile(resolve(root, 'vite.config.ts'), 'utf8'),
      readFile(resolve(root, 'index.html'), 'utf8')
    ])

    expect(viteConfig).toContain("base: '/fingerprint/'")
    expect(viteConfig).toContain("start_url: '/fingerprint/'")
    expect(viteConfig).toContain("scope: '/fingerprint/'")
    expect(html).toContain('href="/fingerprint/favicon.svg"')
    expect(`${viteConfig}\n${html}`).not.toContain('/Fingerprint/')
  })
})
