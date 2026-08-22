# Task 2 report — Pure gallery state

## RED

`npm test -- tests/gallery-state.test.ts` failed as expected before implementation: Vitest could not resolve `../src/lib/gallery-state`.

## GREEN

Added a pure, immutable generic gallery-state module. It creates one zero-based index per supplied category, wraps frame movement within the active collection only, preserves the other category indexes, and returns the original state for an empty collection. Category selection closes the lightbox; explicit open and close transitions each return new state objects.

`createGalleryState()` infers IDs from its non-empty tuple. Its `NoInfer<Ids[number]>` initial-category parameter rejects values outside that tuple; the focused test contains a compile-time `@ts-expect-error` assertion for this contract, verified by `npm run build`.

## Files

- `src/lib/gallery-state.ts`
- `tests/gallery-state.test.ts`
- `.superpowers/sdd/2026-08-22-photography-portfolio/task-2-report.md`

## Tests

| Command / check | Exact result |
| --- | --- |
| `npm test -- tests/gallery-state.test.ts` (RED) | Failed as expected: missing `../src/lib/gallery-state`, 1 failed suite and 0 tests. |
| `npm test -- tests/gallery-state.test.ts` (GREEN) | Passed: 1 file, 5 tests. |
| `npm test` | Passed: 10 files, 26 tests. |
| `npm run build` | Passed: `tsc --noEmit` accepted the generic/invalid-initial-category contract and Vite completed the production build. |
| `git diff --check` | Passed with no whitespace errors. |

## Commit

`Add isolated gallery state` — scoped Task 2 commit.

## Self-review

- `GalleryState` is generic over the category ID and stores a distinct index for each ID.
- The tuple type requires at least one ID; `NoInfer` prevents an invalid initial category from widening the inferred union.
- `moveFrame()` uses only `activeCategory` and the supplied active collection length, so it cannot advance across categories.
- Every non-empty transition copies the state; `length === 0` is an intentional no-op that preserves object identity.
- No DOM controller, page module, style, data manifest, or `progress.md` was modified.

## DONE-BLOCKED

DONE: Task 2 is implemented and verified. BLOCKED: none.
