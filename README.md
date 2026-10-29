# Fingerprint

**A browser mirror, not a tracker.** Fingerprint shows what a page can read from a browser and combines those readings into one repeatable identifier. Measurements run in the browser after the user starts them. There is no app backend, account, analytics, cookie, or signal-upload endpoint. The GitHub Pages host necessarily receives page requests; the app does not send it signal readings. The first visit downloads the document and static app assets. Once cached, the PWA can open offline.

## What it measures

The catalogue contains 28 locally-run signals across screen and viewport, locale and time, hardware, WebGL/canvas/audio/font rendering, display preferences, storage and permission states, speech voices, and coarse connection hints. Each row includes its reading or a reason it was not exposed, what a tracker could do with that class of signal, and what can change it. Permission states are queried without requesting access. Audio is rendered offline and is never played.

Tap **Check my browser** to start; nothing is measured on page load. The first check and **Repeat 5 measurements** run the catalogue locally. The repeated run marks each signal stable or flaky based on the values it actually returned in those five passes; when a signal is unavailable, stability means its availability state stayed the same. The final identifier is SHA-256 over normalized values in catalogue order; it is not a rarity estimate or a privacy score. When an API is hidden, the reason is displayed but excluded from the ID so changing error wording cannot manufacture a new identifier.

Starting a check saves the latest ID and normalized signal values to `localStorage` solely to compare the next visit and show changed rows. This local receipt is explained in the interface; it is not a history. **Forget me** removes it. If the browser blocks local storage, the measurement still works but cross-visit comparison cannot be saved. Permission queries never open a prompt. The page does not set cookies.

A VPN does not change most of these signals. Private browsing usually does not either. A separate tracker that also has an IP address and a cookie could connect a browser profile to a network address and a returning visit. This app does not read your IP or set a cookie; its static host still handles the page request.

## Receipt and verification

No actual browser session was available for the implementation checks, so no personal ID, repeated-run result, or browser-change diff is reported here. No iOS device, second browser, or physical device was opened. We do not claim how a browser we did not run behaves. To make a real receipt, open the deployed app in the browser under test, run one check, reload and run it again, then use **Repeat 5 measurements** or deliberately change one setting. Record the values and changes actually shown; a setting such as zoom may change some readings and leave others untouched, so do not assume the result in advance.

The network guard scans `src/` and `public/` for outbound networking APIs and remote assets. Static app files are normal same-origin page resources, not telemetry. The PWA service worker precaches those assets for offline use.

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
