# Fingerprint

**A browser mirror, not a tracker.** Fingerprint shows what a page can read from a browser and combines those readings into one repeatable identifier. It runs in the browser: no account, analytics, server endpoint, cookie, or signal upload. The app code sends no telemetry and makes no signal-upload requests. The first page load necessarily downloads the site's own document and static app assets; after the PWA has cached them, it can open offline.

## What it measures

The catalogue contains 28 locally-run signals across screen and viewport, locale and time, hardware, WebGL/canvas/audio/font rendering, display preferences, storage and permission states, speech voices, and coarse connection hints. Each row includes its value or a reason the browser did not expose it, what a tracker could do with that class of signal, and what can change it. Permission states are queried without requesting access. Audio is rendered offline and is never played.

Tap **Check my browser** to start. Nothing is measured on page load. Tap **Repeat 5 times** to run the catalogue five times in sequence and see which values stayed the same during those runs. The final identifier is SHA-256 over normalized values in catalogue order; it is not a rarity estimate or a privacy score. Browser APIs can be hidden or vary, and some browsers report unavailable values. Unavailable reasons are visible but do not affect the hash.

Fingerprint saves the most recent ID and normalized signal values to `localStorage` only to compare the next visit and show changed rows. It does not save a history. The receipt is visible in the page and the **Forget me** button removes it. If the browser blocks local storage, the measurement still works but cross-visit comparison cannot be saved. Permission queries never open a prompt. The page does not set cookies.

A VPN does not change most of these signals. Private browsing usually does not either. A tracker that also has an IP address and a cookie could connect browser signals to a network address and a returning visit; this page itself has no server to receive that information.

## Receipt and verification

No real browser session was available to this implementation run, so there is no measured ID, repeated-run result, or before/after browser change to report here. No iOS device, second browser, or physical device was opened. We do not claim how a browser we did not run behaves. To produce a real receipt, serve the app, open it in the browser under test, run one check, reload and run it again, then use **Repeat 5 times** or deliberately change one setting (for example, zoom) and compare the rows. Record which changed and which did not from that browser's actual screen; do not treat an expected result as an observation.

The network guard scans `src/` and `public/` for outbound networking APIs and remote assets. The app's first visit downloads its static app bundle as normal page resources; it has no telemetry request. The PWA service worker precaches the same-origin app assets for offline use.

## Development

Requirements: Node.js 22 and npm.

```sh
npm ci
npm run dev
npm run typecheck
npm test -- --run
npm run build
```

The GitHub Pages build uses the `/Fingerprint/` base path matching the repository name. CI runs typecheck, tests, and build for pull requests; deployment is restricted to pushes to `main`. The installable PWA uses a dark standalone manifest and a generated precache service worker.
