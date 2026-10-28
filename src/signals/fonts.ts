import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'fonts', label: 'Installed fonts', category: 'Rendering',
  explanation: 'Fonts detected by comparing text widths against generic fallbacks.', trackerUse: 'A tracker can use the set of available fonts as a distinctive signal.', changesWhen: 'Installing or removing a font, or a font extension, can change the list.'
}

function detectFonts(): string[] {
  const candidates = ['Arial', 'Arial Black', 'Calibri', 'Cambria', 'Comic Sans MS', 'Courier New', 'Georgia', 'Helvetica', 'Impact', 'Palatino', 'Segoe UI', 'Times New Roman', 'Trebuchet MS', 'Verdana']
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser does not provide a 2D canvas for font checks.')
  const sample = 'mmmmmmmmmmlli'
  const bases = ['monospace', 'sans-serif', 'serif']
  const baseline = bases.map((base) => { context.font = `72px ${base}`; return context.measureText(sample).width })
  return candidates.filter((font) => bases.some((base, index) => {
    context.font = `72px '${font}', ${base}`
    return context.measureText(sample).width !== baseline[index]
  })).sort()
}
export const measure: SignalReader = () => readSignal(spec, detectFonts)
