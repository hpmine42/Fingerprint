import { readAsyncSignal, sha256 } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'canvas-hash', label: 'Canvas rendering', category: 'Rendering',
  explanation: 'A hash of fixed text and shapes rendered into an off-screen canvas.', trackerUse: 'A tracker can compare tiny rendering differences between browsers.', changesWhen: 'Fonts, graphics drivers, or browser rendering changes can alter this; zoom alone may not.'
}

async function canvasFingerprint(): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = 240
  canvas.height = 80
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('This browser does not provide a 2D canvas.')
  context.textBaseline = 'alphabetic'
  context.fillStyle = '#f60'
  context.fillRect(11, 9, 61, 23)
  context.fillStyle = '#069'
  context.font = '17px Arial'
  context.fillText('Fingerprint • 42', 5, 51)
  context.strokeStyle = 'rgba(30, 90, 180, 0.7)'
  context.beginPath()
  context.arc(168, 37, 20, 0, Math.PI * 1.5)
  context.stroke()
  return sha256(Array.from(context.getImageData(0, 0, canvas.width, canvas.height).data).join(','))
}
export const measure: SignalReader = () => readAsyncSignal(spec, canvasFingerprint)
