import { readSignal } from './read'
import type { SignalReader } from './types'

const spec = {
  id: 'webgl-renderer', label: 'WebGL renderer', category: 'Rendering',
  explanation: 'The unmasked graphics renderer, when the browser permits access.', trackerUse: 'A tracker can use GPU details alongside rendering output.', changesWhen: 'A graphics driver, GPU, or browser privacy policy can change or hide it.'
}

export const measure: SignalReader = () => readSignal(spec, () => (() => { const gl = document.createElement("canvas").getContext("webgl"); if (!gl) throw new Error("This browser does not provide WebGL."); const ext = gl.getExtension("WEBGL_debug_renderer_info"); if (!ext) throw new Error("This browser hides the unmasked GPU name."); return String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) })())
