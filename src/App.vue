<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { catalogue, catalogueLabels } from './signals/catalogue'
import type { Signal, SignalValue } from './signals/types'
import { diffSignals, fingerprint, normalizeValue } from './core'
import { forgetVisit, loadVisit, saveVisit, type SavedVisit } from './persistence'

const signals = shallowRef<Signal[]>([])
const fullHash = ref('')
const busy = ref(false)
const activeLabel = ref('')
const hasRun = ref(false)
const repeated = ref(false)
const stability = ref<Record<string, boolean>>({})
const previousVisit = shallowRef<SavedVisit | null>(null)
const changes = ref<Array<{ id: string; label: string; before: string; after: string }>>([])
const sameAsLast = ref<boolean | null>(null)
const receiptSaved = ref(true)
const forgetMessage = ref('')

const groups = computed(() => {
  const grouped = new Map<string, Signal[]>()
  for (const signal of signals.value) {
    const rows = grouped.get(signal.category) ?? []
    rows.push(signal)
    grouped.set(signal.category, rows)
  }
  return [...grouped.entries()]
})
const availableCount = computed(() => signals.value.filter((signal) => signal.available).length)
const stableCount = computed(() => Object.values(stability.value).filter(Boolean).length)
const shortHash = computed(() => fullHash.value ? `${fullHash.value.slice(0, 4)}-${fullHash.value.slice(4, 8)}-${fullHash.value.slice(8, 12)}` : '')

function displayValue(value: SignalValue): string {
  if (typeof value === 'string') return value || 'Empty string'
  if (value === null) return 'No value'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function displayChangedValue(value: SignalValue): string {
  if (typeof value === 'object' && value !== null && 'unavailable' in value) return 'Unavailable'
  return displayValue(value)
}

function savedSignals(saved: SavedVisit, current: Signal[]): Signal[] {
  return saved.values.map((entry) => {
    const template = current.find((signal) => signal.id === entry.id)
    const unavailable = typeof entry.value === 'object' && entry.value !== null && 'unavailable' in entry.value
    return {
      id: entry.id,
      label: template?.label ?? entry.id,
      category: template?.category ?? 'Other',
      value: unavailable ? null : entry.value,
      available: !unavailable,
      explanation: template?.explanation ?? '',
      trackerUse: template?.trackerUse ?? '',
      changesWhen: template?.changesWhen ?? ''
    }
  })
}

async function runMeasurement(repeatFive = false): Promise<void> {
  if (busy.value) return
  busy.value = true
  forgetMessage.value = ''
  if (!hasRun.value) {
    previousVisit.value = loadVisit()
    changes.value = []
    sameAsLast.value = null
  }
  const runs: Signal[][] = []
  const runCount = repeatFive ? 5 : 1
  try {
    for (let runIndex = 0; runIndex < runCount; runIndex += 1) {
      const current: Signal[] = []
      for (const [signalIndex, reader] of catalogue.entries()) {
        activeLabel.value = catalogueLabels[signalIndex] ?? 'next signal'
        const signal = await reader()
        current.push(signal)
      }
      runs.push(current)
      signals.value = current
    }
    const latest = runs[runs.length - 1] ?? []
    signals.value = latest
    const hash = await fingerprint(latest)
    fullHash.value = hash
    const priorHash = previousVisit.value?.id
    if (!hasRun.value && previousVisit.value) {
      sameAsLast.value = priorHash === hash
      changes.value = diffSignals(savedSignals(previousVisit.value, latest), latest).map((change) => ({ id: change.id, label: change.label, before: displayChangedValue(change.before), after: displayChangedValue(change.after) }))
    }
    if (repeatFive) {
      stability.value = Object.fromEntries(latest.map((signal) => [
        signal.id,
        runs.every((run) => {
          const other = run.find((item) => item.id === signal.id)
          return Boolean(other) && JSON.stringify(normalizeValue(other?.available ? other.value : { unavailable: true })) ===
            JSON.stringify(normalizeValue(signal.available ? signal.value : { unavailable: true }))
        })
      ]))
      repeated.value = true
    }
    receiptSaved.value = true
    saveVisit(hash, latest)
    // Detect storage refusal without exposing or retaining the signal snapshot elsewhere.
    receiptSaved.value = loadVisit()?.id === hash
    hasRun.value = true
  } catch (error) {
    forgetMessage.value = error instanceof Error ? error.message : 'The measurement could not be completed.'
  } finally {
    busy.value = false
    activeLabel.value = ''
  }
}

function forgetMe(): void {
  const receiptRemoved = forgetVisit()
  previousVisit.value = null
  changes.value = []
  sameAsLast.value = null
  receiptSaved.value = false
  forgetMessage.value = receiptRemoved ? 'Your saved local receipt has been removed.' : 'This browser blocked access to its local receipt, so the app could not remove it.'
}
</script>

<template>
  <main class="shell">
    <header class="topbar">
      <a class="wordmark" href="#top" aria-label="Fingerprint home"><span class="mark" aria-hidden="true"><i></i></span>fingerprint</a>
      <span class="local-label"><span class="local-dot"></span> LOCAL ONLY</span>
    </header>

    <section id="top" class="intro">
      <p class="eyebrow">A browser mirror</p>
      <h1>Your browser has<br /><em>a signature.</em></h1>
      <p class="lede">Websites can read more than you might think. See the signals your browser shares — measured here, on this device, never sent anywhere.</p>
      <div class="honesty-line"><span aria-hidden="true">↳</span> A VPN does not change most of these signals. Private browsing usually does not either.</div>
      <button v-if="!hasRun" class="button primary" :disabled="busy" @click="runMeasurement()">
        {{ busy ? 'Measuring…' : 'Check my browser' }} <span aria-hidden="true">→</span>
      </button>
      <div v-else class="actions">
        <button class="button primary" :disabled="busy" @click="runMeasurement(true)">{{ busy ? 'Measuring…' : 'Repeat 5 times' }} <span aria-hidden="true">↻</span></button>
        <button class="button secondary" :disabled="busy" @click="forgetMe">Forget me</button>
      </div>
      <p v-if="busy" class="progress" aria-live="polite"><span class="pulse"></span> Reading {{ activeLabel || 'the next signal' }}<span class="progress-note"> · no sound, no prompts</span></p>
      <p v-if="forgetMessage" class="notice" role="status">{{ forgetMessage }}</p>
      <p v-if="hasRun && !forgetMessage" class="receipt-note">{{ receiptSaved ? 'Your last ID and signal values are stored in this browser only so this page can compare your next visit.' : 'This browser did not allow a local receipt to be saved.' }}</p>
    </section>

    <template v-if="hasRun">
      <section class="summary" aria-live="polite">
        <div class="summary-number">{{ signals.length }}</div>
        <div><strong>signals checked</strong><p>{{ availableCount }} values available · {{ signals.length - availableCount }} unavailable with a reason</p></div>
      </section>

      <section v-if="sameAsLast !== null" class="visit-diff" :class="sameAsLast ? 'unchanged' : 'changed'" aria-live="polite">
        <div class="diff-symbol" aria-hidden="true">{{ sameAsLast ? '＝' : '↗' }}</div>
        <div class="diff-copy">
          <h2>{{ sameAsLast ? 'Identical to last visit' : `${changes.length} ${changes.length === 1 ? 'signal' : 'signals'} changed` }}</h2>
          <p>{{ sameAsLast ? 'The measured values and ID match the receipt saved in this browser.' : 'Compared with your last saved visit on this browser. Only these signal values differ.' }}</p>
          <div v-if="!sameAsLast && changes.length" class="changed-list">
            <div v-for="change in changes" :key="change.id" class="changed-row">
              <strong>{{ change.label }}</strong>
              <span>{{ change.before }}</span><b aria-hidden="true">→</b><span>{{ change.after }}</span>
            </div>
          </div>
          <p v-if="!receiptSaved" class="diff-footnote">No previous receipt could be saved, so a future visit cannot be compared.</p>
        </div>
      </section>

      <section v-if="repeated" class="stability-callout">
        <span class="stability-icon" aria-hidden="true">◎</span>
        <p><strong>{{ stableCount }} of {{ signals.length }} signals stayed stable</strong> across five consecutive measurements. A flaky result changed during those runs; unavailable values are compared by availability, not by error wording.</p>
      </section>

      <section class="catalogue" aria-label="Browser signals">
        <div class="section-heading"><div><p class="eyebrow">The readings</p><h2>What a page can see</h2></div><span v-if="repeated" class="status-key"><i class="stable-dot"></i> stable <i class="flaky-dot"></i> flaky</span></div>
        <div v-for="([category, rows], groupIndex) in groups" :key="category" class="signal-group">
          <h3 class="category-title"><span>{{ String(groupIndex + 1).padStart(2, '0') }}</span>{{ category }}</h3>
          <article v-for="signal in rows" :key="signal.id" class="signal-card" :class="{ 'signal-changed': changes.some((change) => change.id === signal.id) }">
            <div class="signal-topline"><h4>{{ signal.label }}</h4><span v-if="repeated" class="stability-state" :class="stability[signal.id] ? 'is-stable' : 'is-flaky'">{{ stability[signal.id] ? 'Stable' : 'Flaky' }}</span><span v-if="changes.some((change) => change.id === signal.id)" class="changed-tag">CHANGED</span></div>
            <code class="signal-value" :class="{ unavailable: !signal.available }">{{ signal.available ? displayValue(signal.value) : signal.reason }}</code>
            <p class="signal-explanation">{{ signal.explanation }}</p>
            <div class="signal-notes"><p><span>TRACKERS MAY</span>{{ signal.trackerUse }}</p><p><span>WHAT CAN CHANGE IT</span>{{ signal.changesWhen }}</p></div>
          </article>
        </div>
      </section>

      <section class="closing-grid">
        <article class="closing-card"><p class="eyebrow">The boundary</p><h2>What this page does <em>not</em> know</h2><p>No location beyond the time zone. No name, browsing history, other tabs, or files. It does not ask for camera, microphone, location, or notification access.</p></article>
        <article class="closing-card inverse"><p class="eyebrow">The honest inverse</p><h2>Combined with more</h2><p>A tracker that also has an IP address and a cookie could connect this browser profile to a network address and a repeat visit. This page has neither your IP nor a cookie available to its code.</p></article>
      </section>

      <section class="id-panel">
        <p class="eyebrow">All readings, one identifier</p>
        <h2>Your browser’s ID</h2>
        <div class="id-value" aria-label="Short browser identifier">{{ shortHash }}</div>
        <p class="id-status" aria-live="polite"><span aria-hidden="true">{{ sameAsLast ? '✓' : '·' }}</span>{{ sameAsLast ? 'Same as last visit' : sameAsLast === false ? `${changes.length} signals differ from last visit` : 'No earlier receipt to compare' }}</p>
        <details class="hash-details">
          <summary>Show full SHA-256 hash</summary>
          <code>{{ fullHash }}</code>
        </details>
        <p class="hash-method">SHA-256 of normalized signal values. Not a population rarity estimate.</p>
      </section>

      <p class="privacy-foot">No account. No analytics. No signal uploads. The only saved data is the local receipt described above. <button class="text-button" @click="forgetMe">Forget me</button></p>
    </template>

    <section v-else class="preview-card">
      <span class="preview-mark" aria-hidden="true">◉</span>
      <div><h2>Nothing runs until you ask.</h2><p>One tap measures the signals. Your ID appears at the end, with a clear receipt of what stayed the same.</p></div>
    </section>

    <footer><span>FINGERPRINT · A MIRROR, NOT A TRACKER</span><span>BUILT TO MEASURE, EXPLAIN, FORGET</span></footer>
  </main>
</template>
