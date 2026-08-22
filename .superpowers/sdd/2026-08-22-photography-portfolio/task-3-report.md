# Task 3 report — Gallery DOM controller and lightbox

## RED

`npm test -- tests/gallery.test.ts` failed as expected before implementation: Vitest could not resolve `../src/lib/gallery`.

## GREEN

Added a generic DOM gallery controller with isolated category positions, circular frame navigation, 48 px pointer-swipe handling, keyboard navigation, adjacent-full-image preloading, an intentional empty state, and an accessible modal viewer. The photography page now renders the approved category rail and gallery stage from the typed empty collections; no gallery photos or category-card artwork were invented.

## Files

- `src/lib/gallery.ts`
- `tests/gallery.test.ts`
- `src/pages/photography.ts`
- `src/styles/portfolio-components.css`
- `src/styles/portfolio-layout.css`
- `src/styles/portfolio-motion.css`
- `.superpowers/sdd/2026-08-22-photography-portfolio/task-3-report.md`

## Tests

| Command / check | Exact result |
| --- | --- |
| `npm test -- tests/gallery.test.ts` (RED) | Failed as expected: missing `../src/lib/gallery`, 1 failed suite and 0 tests. |
| `npm test -- tests/gallery-state.test.ts tests/gallery.test.ts` | Passed: 2 files, 10 tests. |
| `npm test` | Passed: 11 files, 31 tests. |
| `npm run build` | Passed: TypeScript and the production Vite build completed. |
| `git diff --check` | Passed with no whitespace errors. |

## Browser

BLOCKED: browser automation could reach only an existing Vite server on port 5173, which serves a different worktree. This task's Vite preview on ports 5174 and 4174 accepted local shell connections only after a static-server fallback, but the in-app Browser timed out to those ports. To avoid validating the wrong page, no visual success claim is made. The automated DOM tests cover the empty state, category isolation, wrapping, keyboard handling, pointer threshold, Escape/focus return, adjacent preloading, and listener cleanup.

## Commit

`Build photography portfolio gallery` — scoped Task 3 commit.

## Self-review

- Categories use only their active collection and remember individual indices.
- Empty collections disable frame controls and present an intentional Russian empty state.
- Lightbox state exposes `role="dialog"`, `aria-modal`, Escape close, focus return, focus trapping, and listener cleanup.
- Only immediately adjacent `full` URLs are preloaded; empty collections preload nothing.
- Desktop uses a narrow category rail with a 4:5-capable stage; mobile switches to a horizontal scroll-snap rail with 44 px controls.
- White 0.2 mm borders, subtle glow, and reduced-motion overrides are present.
- `progress.md` was not modified.

## DONE-BLOCKED

DONE: implementation, focused/full tests, production build, and diff check are complete.

BLOCKED: the mandatory in-app-browser desktop/mobile visual check cannot reach this worktree's local preview in the current environment; see Browser above.

---

## Fix Round 1

### Findings and root causes

1. The category rail correctly referenced the four declared card paths, but Task 3 rendered them before Task 4 had supplied files. Browsers therefore requested missing WebPs and showed broken cards.
2. Gallery pointer listeners were attached only to the image button. Without pointer capture, a drag that ended outside could fail to deliver its final event to that button.

### Files and assets

- Added `public/media/photography/cards/studio.webp`
- Added `public/media/photography/cards/wedding.webp`
- Added `public/media/photography/cards/product.webp`
- Added `public/media/photography/cards/concert.webp`
- Updated `src/lib/gallery.ts`
- Updated `tests/gallery.test.ts`
- Appended this report; `progress.md` remains unchanged.

All cards were generated with the built-in image tool, visually inspected, converted to WebP, and verified at 1122×1402 px (4:5-ish): studio 78 KB, wedding 79 KB, product 39 KB, concert 64 KB. No gallery works were created; every `photographyCategories[*].items` array remains empty.

### Prompts

Each asset used `stylized-concept` as a premium photorealistic editorial still-life category card: dark neutral graphite setting with a subtle brushed-aluminium background, controlled amber key, cool cyan rim, cinematic contrast, vertical 4:5 framing, no people, readable text, logos, or watermarks. Subjects were respectively: professional studio light plus camera; wedding rings, white fabric, and bouquet detail; unbranded neutral product on a clean pedestal; and concert stage lights with distant anonymous crowd silhouettes.

### Tests

- RED: the new pointer-capture regression failed because `setPointerCapture(8)` was never called.
- GREEN: `npm test -- tests/gallery.test.ts` — 1 file, 6 tests passed.
- `npm test -- tests/gallery-state.test.ts tests/gallery.test.ts` — 2 files, 11 tests passed.
- `npm test` — 11 files, 32 tests passed.
- `npm run build` and `git diff --check` — passed.
- Declared card-path validation — all four referenced assets exist and are non-empty.

### Commit

`Fix photography cards and pointer capture` — scoped Fix Round 1 commit.
