import { readAsyncSignal, sha256 } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'audio-hash', label: 'Audio rendering', category: 'Rendering',
  explanation: 'A hash of a silent, offline oscillator and compressor render; no sound is played.', trackerUse: 'A tracker can compare differences in audio processing output.', changesWhen: 'Audio hardware, browser versions, or system audio configuration can change it.'
}

async function audioFingerprint(): Promise<string> {
  const AudioContextClass = window.OfflineAudioContext ?? (window as Window & { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext
  if (!AudioContextClass) throw new Error('This browser does not provide offline audio rendering.')
  const context = new AudioContextClass(1, 44100, 44100)
  const oscillator = context.createOscillator()
  const compressor = context.createDynamicsCompressor()
  oscillator.type = 'triangle'
  oscillator.frequency.value = 10000
  compressor.threshold.value = -50
  compressor.knee.value = 40
  compressor.ratio.value = 12
  compressor.attack.value = 0
  compressor.release.value = 0.25
  oscillator.connect(compressor)
  compressor.connect(context.destination)
  oscillator.start(0)
  const buffer = await context.startRendering()
  const channel = buffer.getChannelData(0)
  const samples = Array.from({ length: 64 }, (_, index) => Number(channel[Math.floor(index * (channel.length - 1) / 63)].toFixed(8)))
  return sha256(JSON.stringify(samples))
}
export const measure: SignalReader = () => readAsyncSignal(spec, audioFingerprint)
