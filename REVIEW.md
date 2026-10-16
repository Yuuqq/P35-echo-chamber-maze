# Code Review: P35 信息茧房收敛迷宫

Living review of `P35-echo-chamber-maze`. Anchors are function and file names, not line numbers, because line numbers drifted twice in previous passes. Severity is for the tree that contains this file.

`QA.md` is a manual script. It is not evidence that a behavior works.

## How this was checked

- Read: `index.html`, `app.js`, `echo-logic.js`, `sw.js`, `styles.css`, `manifest.json`, `README.md`, `SPEC.md`, `QA.md`, `pm-metrics.js`.
- Ran `node --test` against `echo-logic.js` (no DOM).
- Confirmed `https://yuuqq.github.io/shared/releases/v2.6/{loader,dark-toggle,cmd-palette,toast,onboarding,global-nav,kbd-hints}.js` respond 200. This repo does not contain `shared/`.

## Remediated

### Meter, status, and feed share one signal

- **Where:** `echo-logic.js` — `calcDiversity`, `getWeightedFeedTags`, `statusText`, `biasStatus`. Wired from `app.js`.
- **Was:** The meter looked at click mass (`total < 4`) and the feed looked at `step`. 「快速偏向」adds `+2` to a tag and `+1` to `step`, so two presses painted 「已陷入信息茧房」 while `getWeightedFeedTags` still returned A/B/C/D. Three ordinary reads did the opposite: the meter stayed at 100% while the feed was already weighted.
- **Now:** Both functions take `(clicks, tags)` only. `step` is a label, not a gate. Named thresholds: `MIN_SAMPLES` (4), `ECHO_RATIO` (0.75), `STRONG_RATIO` (0.60), `NARROW_RATIO` (0.50).
- **Acceptance encoded in `test/echo-logic.test.js`:**
  - `{A:4}` (two fast-bias clicks, or four reads) → diversity `0.1`, feed is only `A`, copy says 一种声音.
  - `{A:2}` (one fast-bias click) → diversity `1`, feed is still all four tags, copy says 尚未收窄.
  - `{A:3}` → diversity `1` and the feed is still all four tags.
  - `{A:1,B:1,C:1,D:1}` → diversity stays above 0.7 and the copy does not say 一种声音.
  - `{A:2,B:2}` → diversity `0.55`, feed is only A and B (clicked tags). Not an echo alarm.
  - `{A:5,B:2,C:1}` → diversity `0.35`, feed keeps A and B.
- **SPEC FR-1:** narrowing is stepwise for mixed reading (all tags → clicked tags → top two → dominant tag). A reader who clicks only one tag still crosses from fully open to echo at `MIN_SAMPLES`, because their ratio is already 1. That jump is the same signal, not a second clock.

### Reset copy is no longer overwritten

- **Where:** `app.js` reset handler. `updateDiversityDisplay` does not call `setStatus`.
- **Was:** reset wrote 「已重置，重新开始探索」, then the diversity updater replaced it with the welcome sentence.
- **Now:** `renderFeed()` runs first, then the handler sets the reset sentence. Fast-bias does the same and restores a 「快速偏向 …」 sentence after render.

### Service worker asset list

- **Where:** `sw.js` `CORE_ASSETS`.
- **Was:** precached a stale `../shared/dark-toggle.js` and missed the v2.6 loader plus the modules declared by `data-modules="dark,cmd,toast,onboarding,nav,kbd"`.
- **Now:** those v2.6 URLs are listed, the stale path is gone, and `./echo-logic.js` plus `./manifest.json` are included.
- **Also:** a non-document offline miss used to `respondWith` an implicit `undefined` (TypeError). It now returns a 503. A precache miss logs `console.warn` instead of failing with an empty `catch`.

### Diversity colors follow the theme

- **Where:** `styles.css` `--div-high` / `--div-mid` / `--div-low`; `app.js` `paintTone`.
- **Was:** `#16a34a` / `#d97706` / `#dc2626` / `#888` were inline on the meter, the readout, and the status line, so `data-theme="dark"` could not restyle them.
- **Now:** those nodes use classes. Dark theme (explicit or `prefers-color-scheme`) swaps the three diversity colors. The status line uses `--ink-secondary`.

### `innerHTML` text is escaped

- **Where:** `app.js` `escapeHtml`, used by `renderFeed` and `renderHistory`. Tag class is restricted to `a`–`d`.
- **Current exploitability:** still none. `NEWS` is hardcoded and history text is taken from `textContent` or a fixed string. Escaping is hygiene for a later data source, not a claim that an attack exists today. DOMPurify is unnecessary for this page.

### Theme color

- **Where:** `manifest.json` `theme_color` / `background_color`.
- **Was:** manifest `#c7491f` / `#f4f0e8` against `index.html` `theme-color` `#7c3aed` and page `--bg` `#f2f8ff`.
- **Now:** manifest matches the page (`#7c3aed`, `#f2f8ff`).

## Open

### Service worker scope and silence — MEDIUM, not HIGH

Offline loss of the shared chrome is a degraded teaching page, not a security incident.

Still true:

- `shared/` is not in this repository. On GitHub Pages, `../shared/` is `https://yuuqq.github.io/shared/`. A local server started inside this repo 404s those files.
- `CACHE_NAME` stays `journalism-tool-v1` on purpose. `activate` deletes every other cache name, and Cache Storage is per origin, so renaming it here would wipe other tools on `yuuqq.github.io`.
- `cache.addAll` still falls through to per-URL `add` after the first failure. Failures are now warned, not surfaced in the UI.
- The feed is repainted with `innerHTML`, so keyboard focus on 「点击阅读」 is still dropped. `pm-metrics.js` binds `cta_click` on `DOMContentLoaded` only, and `app.js` never calls `markTaskStart` / `markTaskComplete`.

### CSP — LOW, hypothetical

There is no CSP. A meta policy that omits inline script and `data:` would break the inline service-worker registration and the SVG favicon. A policy that allows `'unsafe-inline'` barely constrains XSS. Prefer a real response header later. Not a merge blocker: the page has no user-controlled URL and no third-party script host beyond the same GitHub Pages origin.

### README claims vs. this repo — LOW

`README.md` now says how to boot the page from the toolbox layout and what offline actually covers. The shared command palette, onboarding, and toasts still live outside this repo. Dynamic controls still have no durable accessible name beyond the button text.

### Documents that still describe a different product — LOW

- `SPEC.md` lists the Canvas API, loading/error states, and unchecked acceptance boxes. None of the Canvas or error-state machinery exists.
- `styles.css` below the P35 rules still carries toolbox leftovers (`.maze-cell`, `#scanBtn`, and similar).
- `screenshot-playwright.png` is checked in and unused by the page.

## Security

No secrets, no backend, no user-controlled URL. Same-origin GET only in the service worker. `pm-metrics.js` can store a referrer and click text in `localStorage` (capped). That store is local, and the task-completion API is not connected. The escaped `innerHTML` path does not create a current XSS.
