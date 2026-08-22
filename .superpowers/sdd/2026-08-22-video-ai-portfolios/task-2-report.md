# Task 2 report — Shared YouTube work-list controller

## RED

`npm test -- tests/video-playlist.test.ts` failed as expected before implementation: Vite could not resolve `../src/lib/video-playlist` because the controller module did not exist.

## GREEN

Added a generic, shared YouTube playlist controller and typed filter helper. Filters retain the supplied work order and only re-render the visible list; they never set the iframe source. A work click selects exactly one item, loads one privacy-enhanced YouTube embed with autoplay enabled, updates active and `aria-pressed` states, and sets the player title and required iframe permissions.

The controller works with both videographer categories and an independent `ai` category, keeps an intentional empty list readable, exposes an exact direct watch URL after an iframe error, scrolls only for `max-width: 820px`, and unregisters every installed listener in its cleanup function. Production video data remains untouched and empty.

## Files

- `src/lib/video-playlist.ts`
- `tests/video-playlist.test.ts`
- `.superpowers/sdd/2026-08-22-video-ai-portfolios/task-2-report.md`

## Tests

| Command / check | Exact result |
| --- | --- |
| `npm test -- tests/video-playlist.test.ts` (RED) | Failed as expected: unresolved `../src/lib/video-playlist`, 1 failed suite and 0 tests. |
| `npm test -- tests/video-playlist.test.ts` (GREEN) | Passed: 1 file, 7 tests. |
| `npm test -- tests/youtube.test.ts tests/video-playlist.test.ts` | Passed: 2 files, 10 tests. |
| `npm test` | Passed: 13 files, 42 tests. |
| `npm run build` | Passed: TypeScript check and Vite production build completed. |
| `git diff --check` | Passed with no whitespace errors. |

## Commit

`Add shared YouTube portfolio player` — scoped Task 2 commit.

## Self-review

- `filterVideoWorks()` is generic and uses native `filter()`, preserving the original input order and returning the exact input list for `all`.
- The iframe has no `src` before a concrete work click; filter listeners only update the filtered rows and their active states.
- Work selection writes one nocookie embed URL with `autoplay=1`, an item-specific title, the required `allow`, `allowfullscreen`, and strict referrer policy.
- The fallback link is assigned only for the selected work when the iframe reports an error, and its URL comes from the validated watch-URL helper.
- Mobile scrolling is guarded by `matchMedia('(max-width: 820px)')`; cleanup removes the filter, list-delegation, and iframe-error listeners.
- No production lists, page modules, styles, or `progress.md` were modified.

## DONE-BLOCKED

DONE: Task 2 controller, tests, production build, diff checks, scoped commit, and report are complete.

BLOCKED: none.
