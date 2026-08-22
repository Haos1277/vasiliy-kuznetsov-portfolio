# Task 3 report — Home links and service preselection

## Status

DONE

## Summary

- Replaced the four disabled home-page portfolio placeholders with base-aware anchors generated through `portfolioHref()`.
- Renamed `Discipline.futurePath` to typed `portfolioRoute` values for the four supported portfolio routes.
- Added an immutable four-service allowlist and `readBookingService()` URL parser.
- `initBookingForm()` now preselects a query service only when it is approved and an existing select option has that exact value.
- Preserved the existing home-page presentation and booking behavior outside the required link and preselection changes.

## Files

- `src/main.ts`
- `src/content.ts`
- `src/lib/booking.ts`
- `tests/booking.test.ts`
- `tests/page-structure.test.ts`

## Tests

| Command / check | Exact result |
| --- | --- |
| `npm test -- tests/booking.test.ts tests/page-structure.test.ts` (RED) | Failed as expected: missing `readBookingService`, URL service remained unselected, and no portfolio anchors existed (3 failed, 4 passed). |
| `npm test -- tests/booking.test.ts tests/page-structure.test.ts` | Passed: 2 files, 7 tests. |
| `npm test` | Passed: 8 files, 18 tests. |
| `npm run build` | Passed: TypeScript check and Vite production build emitted all five HTML entry points. |
| `git diff --check` | Passed with no whitespace errors. |
| Browser check (local production preview) | At 1280 px, every home portfolio link opened its matching page with no horizontal overflow; every CTA returned to `#booking` and selected its service. At 390 px, all four pages had no horizontal overflow. No console errors. |

## Commit

`Connect portfolio pages to booking` — scoped Task 3 commit.

## Self-review

- The route links use `portfolioHref()` and retain the configured GitHub Pages base path.
- Query input is constrained to a frozen allowlist, so unknown services do not affect the form.
- Option validation happens before assigning the select value, preserving the default when a page/form omits the requested service.
- Focused tests cover valid parsing, invalid parsing, a present option, and an absent option; structure tests cover all four enabled anchors and their base-aware routes.
- `progress.md` was not modified; no visual styles were changed.

## Blocked

None.
