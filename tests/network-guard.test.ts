import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')
const forbidden: Array<[string, RegExp]> = [
  ['fetch', /\bfetch\s*\(/i],
  ['XMLHttpRequest', /\bXMLHttpRequest\b/i],
  ['WebSocket', /\bWebSocket\b/i],
  ['sendBeacon', /\bsendBeacon\b/i],
  ['remote script', /<script\s+src\s*=/i],
  ['remote CSS import', /@import\s+url\s*\(/i]
]

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return /\.(ts|vue|js|css|html|svg)$/.test(entry.name) ? [path] : []
  }))
  return nested.flat()
}

async function violationsIn(contents: string): Promise<string[]> {
  return forbidden.filter(([, pattern]) => pattern.test(contents)).map(([name]) => name)
}

describe('no-network conscience', () => {
  it('keeps the application source and public assets free of network APIs and remote assets', async () => {
    const files = [...await sourceFiles(resolve(root, 'src')), ...await sourceFiles(resolve(root, 'public'))]
    const violations: string[] = []
    for (const file of files) {
      const found = await violationsIn(await readFile(file, 'utf8'))
      violations.push(...found.map((name) => `${file}: ${name}`))
    }
    expect(violations).toEqual([])
  })

  it('rejects a source addition that tries to call fetch', async () => {
    expect(await violationsIn("const result = fetch('/collect')")).toContain('fetch')
  })
})
