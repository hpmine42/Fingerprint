<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { catalogue, catalogueLabels } from './signals/catalogue'
import type { Signal, SignalValue } from './signals/types'
import { diffSignals, fingerprint, stabilityBySignal } from './core'
import { compactDisplayValue } from './presentation'
import { forgetVisit, loadVisit, saveVisit, type SavedVisit } from './persistence'

const signals = shallowRef<Signal[]>([])
const fullHash = ref('')
const busy = ref(false)
const activeLabel = ref('')
const progressRun = ref(1)
const progressTotal = ref(1)
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

function previewValue(signal: Signal): string {
  const value = signal.available ? displayValue(signal.value) : signal.reason ?? 'This browser does not expose this value.'
  return compactDisplayValue(value)
}

function isUnavailable(value: SignalValue): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && value.unavailable === true
}

function displayChangedValue(value: SignalValue): string {
  if (isUnavailable(value)) return 'Unavailable'
  return displayValue(value)
}

function savedSignals(saved: SavedVisit, current: Signal[]): Signal[] {
  return saved.values.map((entry) => {
    const template = current.find((signal) => signal.id === entry.id)
    const unavailable = isUnavailable(entry.value)
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
  progressTotal.value = runCount
  try {
    for (let runIndex = 0; runIndex < runCount; runIndex += 1) {
      progressRun.value = runIndex + 1
      const current: Signal[] = []
      for (const [signalIndex, reader] of catalogue.entries()) {
        activeLabel.value = catalogueLabels[signalIndex] ?? 'next signal'
        current.push(await reader())
      }
      runs.push(current)
      signals.value = current
    }

    const latest = runs[runs.length - 1] ?? []
    signals.value = latest
    const hash = await fingerprint(latest)
    fullHash.value = hash

    if (previousVisit.value) {
      sameAsLast.value = previousVisit.value.id === hash
      changes.value = diffSignals(savedSignals(previousVisit.value, latest), latest).map((change) => ({
        id: change.id,
        label: change.label,
        before: displayChangedValue(change.before),
        after: displayChangedValue(change.after)
      }))
    }

    if (repeatFive) {
      stability.value = stabilityBySignal(runs)
      repeated.value = true
    }

    saveVisit(hash, latest)
    receiptSaved.value = loadVisit()?.id === hash
    hasRun.value = true
  } catch (error) {
    forgetMessage.value = error instanceof Error ? error.message : 'The measurement could not be completed.'
  } finally {
    busy.value = false
    activeLabel.value = ''
    progressTotal.value = 1
    progressRun.value = 1
  }
}

function forgetMe(): void {
  const forgetResult = forgetVisit()
  previousVisit.value = null
  changes.value = []
  sameAsLast.value = null
  receiptSaved.value = false
  forgetMessage.value = forgetResult === 'removed'
    ? 'Your saved local receipt has been removed.'
    : forgetResult === 'empty'
      ? 'There was no saved local receipt to remove.'
      : 'This browser blocked access to its local receipt, so the app could not remove it.'
}
</script>

<template>
  <main class="shell">
    <header class="topbar">
      <a class="wordmark" href="#top" aria-label="Fingerprint home"><span class="wordmark-mark" aria-hidden="true">f</span>fingerprint</a>
      <p class="topbar-note">Signal readings stay in this browser</p>
    </header>

    <section id="top" class="intro">
      <p class="intro-label">A local browser check</p>
      <h1>What can a website<br class="desktop-break" /> read from your browser?</h1>
      <p class="lede">Tap once to measure {{ catalogue.length }} browser signals and see what each one can reveal. The readings stay on this device.</p>
      <p class="honesty-line">A VPN does not change most of these signals. Private browsing usually does not either.</p>
      <div v-if="!hasRun" class="actions">
        <button class="button primary" :disabled="busy" @click="runMeasurement()">{{ busy ? 'Measuring…' : 'Check my browser' }}</button>
        <button class="button secondary" :disabled="busy" @click="forgetMe">Forget me</button>
      </div>
      <div v-else class="actions">
        <button class="button primary" :disabled="busy" @click="runMeasurement(true)">{{ busy ? 'Measuring…' : 'Repeat 5 measurements' }}</button>
        <button class="button secondary" :disabled="busy" @click="forgetMe">Forget me</button>
      </div>
      <p v-if="!hasRun" class="storage-consent">Starting a check saves the ID and normalized readings in this browser so a later visit can be compared. You can remove them with “Forget me”.</p>
      <p v-if="busy" class="progress" aria-live="polite">
        <span v-if="progressTotal > 1">Measurement {{ progressRun }} of {{ progressTotal }} · </span>
        Reading <strong>{{ activeLabel || 'the next signal' }}</strong><span class="progress-note"> · no sound or permission prompts</span>
      </p>
      <p v-if="forgetMessage" class="notice" role="status">{{ forgetMessage }}</p>
      <p v-if="hasRun && !forgetMessage" class="receipt-note">{{ receiptSaved ? 'Stored here only: your last ID and normalized signal readings, for the next-visit comparison.' : 'This browser did not allow a local receipt to be saved.' }}</p>
    </section>

    <template v-if="hasRun">
      <section class="summary" aria-live="polite">
        <p class="summary-count"><strong>{{ signals.length }}</strong><span>signals checked</span></p>
        <p class="summary-detail">{{ availableCount }} values available <span aria-hidden="true">·</span> {{ signals.length - availableCount }} unavailable with a reason</p>
      </section>

      <section v-if="sameAsLast !== null" class="visit-diff" :class="sameAsLast ? 'unchanged' : 'changed'" aria-live="polite">
        <div class="diff-copy">
          <h2>{{ sameAsLast ? 'Identical to last visit' : `${changes.length} ${changes.length === 1 ? 'signal' : 'signals'} changed` }}</h2>
          <p>{{ sameAsLast ? 'The values and ID match the receipt saved in this browser.' : 'Compared with the previous receipt saved here.' }}</p>
          <div v-if="!sameAsLast && changes.length" class="changed-list">
            <div v-for="change in changes" :key="change.id" class="changed-row">
              <strong>{{ change.label }}</strong>
              <span>{{ change.before }}</span><span class="change-arrow" aria-hidden="true">→</span><span>{{ change.after }}</span>
            </div>
          </div>
          <p v-if="!receiptSaved" class="diff-footnote">This result could not be saved for a future visit.</p>
        </div>
      </section>

      <section v-if="repeated" class="stability-note">
        <p><strong>{{ stableCount }} of {{ signals.length }} signals were stable</strong> across five consecutive measurements. Unavailable readings are compared by availability, not by changing error wording.</p>
      </section>

      <section class="catalogue" aria-label="Browser signals">
        <div class="section-heading">
          <div><p class="section-label">The readings</p><h2>What a page can see</h2><p class="section-help">Open a signal for its explanation and tracker context.</p></div>
          <p v-if="repeated" class="status-key"><span class="stable-mark">Stable</span><span class="flaky-mark">Flaky</span></p>
        </div>
        <section v-for="([category, rows]) in groups" :key="category" class="signal-group">
          <h3 class="category-title">{{ category }}</h3>
          <details v-for="signal in rows" :key="signal.id" class="signal-card" :class="{ 'signal-changed': changes.some((change) => change.id === signal.id) }">
            <summary class="signal-summary">
              <span class="signal-summary-copy">
                <span class="signal-heading">
                  <span class="signal-label">{{ signal.label }}</span>
                  <span v-if="repeated" class="stability-state" :class="stability[signal.id] ? 'is-stable' : 'is-flaky'">{{ stability[signal.id] ? 'Stable' : 'Flaky' }}</span>
                  <span v-if="changes.some((change) => change.id === signal.id)" class="changed-tag">Changed</span>
                </span>
                <code class="signal-preview" :class="{ unavailable: !signal.available }">{{ previewValue(signal) }}</code>
              </span>
              <span class="details-hint"><span class="details-open">Details</span><span class="details-close">Hide</span><span class="details-chevron" aria-hidden="true"></span></span>
            </summary>
            <div class="signal-details">
              <p class="signal-full-value"><strong>{{ signal.available ? 'Full value' : 'Unavailable reason' }}</strong><code :class="{ unavailable: !signal.available }">{{ signal.available ? displayValue(signal.value) : signal.reason }}</code></p>
              <p class="signal-explanation">{{ signal.explanation }}</p>
              <dl class="signal-context">
                <div><dt>What a tracker may do</dt><dd>{{ signal.trackerUse }}</dd></div>
                <div><dt>What can change it</dt><dd>{{ signal.changesWhen }}</dd></div>
              </dl>
            </div>
          </details>
        </section>
      </section>

      <section class="closing-note">
        <h2>What this page cannot see</h2>
        <div class="closing-columns">
          <p>No location beyond the time zone. No name, browsing history, other tabs, or files. It does not ask for camera, microphone, location, or notification access.</p>
          <p>A tracker with an IP address and a cookie could connect a browser profile to a network address and a returning visit. This app does not read your IP or set a cookie; its static host still handles the page request.</p>
        </div>
      </section>

      <section class="id-panel" aria-labelledby="id-heading">
        <p class="section-label">The result</p>
        <h2 id="id-heading">Your browser ID</h2>
        <div class="id-value" aria-label="Short browser identifier">{{ shortHash }}</div>
        <p class="id-status" aria-live="polite">{{ sameAsLast ? 'Same as last visit' : sameAsLast === false ? `${changes.length} signals differ from last visit` : 'No earlier receipt to compare' }}</p>
        <details class="hash-details">
          <summary>Show full SHA-256 hash</summary>
          <code>{{ fullHash }}</code>
        </details>
        <p class="hash-method">SHA-256 of normalized signal values. Not a rarity estimate.</p>
      </section>

      <p class="privacy-foot">No account, analytics, or signal uploads. The local receipt exists only for the comparison above. <button class="text-button" @click="forgetMe">Forget me</button></p>
    </template>

    <section v-else class="empty-state">
      <p>Nothing is measured until you choose.</p>
      <p>The ID appears after the readings, with any difference from your last visit shown first.</p>
    </section>

    <footer><span>FINGERPRINT</span><span>A browser mirror, not a tracker.</span></footer>
  </main>
</template>
