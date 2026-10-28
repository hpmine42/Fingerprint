import type { SignalReader } from './types'
import { measure as screenSize } from './screen-size'
import { measure as devicePixelRatio } from './device-pixel-ratio'
import { measure as viewport } from './viewport'
import { measure as orientation } from './orientation'
import { measure as colourDepth } from './colour-depth'
import { measure as timezone } from './timezone'
import { measure as utcOffset } from './utc-offset'
import { measure as languages } from './languages'
import { measure as firstDay } from './first-day'
import { measure as hourCycle } from './hour-cycle'
import { measure as cpuThreads } from './cpu-threads'
import { measure as deviceMemory } from './device-memory'
import { measure as touchPoints } from './touch-points'
import { measure as platform } from './platform'
import { measure as webglVendor } from './webgl-vendor'
import { measure as webglRenderer } from './webgl-renderer'
import { measure as canvasHash } from './canvas-hash'
import { measure as audioHash } from './audio-hash'
import { measure as fonts } from './fonts'
import { measure as colourScheme } from './colour-scheme'
import { measure as reducedMotion } from './reduced-motion'
import { measure as contrast } from './contrast'
import { measure as forcedColours } from './forced-colours'
import { measure as storage } from './storage'
import { measure as cookies } from './cookies'
import { measure as permissions } from './permissions'
import { measure as voices } from './voices'
import { measure as connection } from './connection'

export const catalogueLabels = [
  'Screen size', 'Device pixel ratio', 'Viewport', 'Screen orientation', 'Colour depth',
  'Time zone', 'UTC offset & DST', 'Languages', 'First day of week', 'Hour cycle',
  'Logical processors', 'Device memory', 'Touch points', 'Platform',
  'WebGL vendor', 'WebGL renderer', 'Canvas rendering', 'Audio rendering', 'Installed fonts',
  'Colour scheme', 'Reduced motion', 'Contrast preference', 'Forced colours',
  'Storage estimate', 'Cookies enabled', 'Permission states', 'Speech voices', 'Connection hints'
] as const

export const catalogue: SignalReader[] = [
  screenSize, devicePixelRatio, viewport, orientation, colourDepth,
  timezone, utcOffset, languages, firstDay, hourCycle,
  cpuThreads, deviceMemory, touchPoints, platform,
  webglVendor, webglRenderer, canvasHash, audioHash, fonts,
  colourScheme, reducedMotion, contrast, forcedColours,
  storage, cookies, permissions, voices, connection
]
