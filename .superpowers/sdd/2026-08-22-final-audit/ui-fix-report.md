# Final UI audit — Fix Group 1

## RED

- A valid `?service=Видеосъёмка#booking` selected the service but did not call `scrollIntoView`; the browser's native fragment scroll had already occurred before the dynamically rendered booking section existed.
- At 390px, the photography frame measured 393.12px wide from a 350px available content width (`right: 413.12px`), clipping its right edge. At 375px, the two AI cards overlapped by 2.91px.
- Gallery cleanup coverage did not directly prove that an active pointer capture is released when cleanup happens before `pointerup`.

## GREEN

- Valid service return links schedule a post-render booking scroll. They use `smooth` motion normally and `auto` under reduced-motion; invalid services and non-booking fragments do not scroll.
- Mobile gallery and AI cards now size to the gutter-adjusted grid width via their 4:5 aspect ratio. Desktop keeps its 4:5 gallery frame and 44px gallery controls.
- Gallery cleanup releases the active capture and subsequent pointer events are inert.

## Files

- `src/lib/booking.ts`
- `src/styles/portfolio-layout.css`
- `src/styles/portfolio-components.css`
- `tests/booking.test.ts`
- `tests/gallery.test.ts`

## Browser measurements

| Viewport | Photography frame | AI cards | Result |
| --- | --- | --- | --- |
| 1440px | 1012.52 × 1265.64px (4:5) | n/a | Gallery controls are 44 × 44px. |
| 390px | 350 × 437.5px, `left: 20`, `right: 370` | 169.40 × 211.74px each; no overlap | Fully within viewport. |
| 375px | 335 × 418.75px, `left: 20`, `right: 355` | 161.90 × 202.37px each; no overlap | Fully within viewport. |

Booking return-link assertions passed at 1440px and 390px: `#booking` intersected the viewport and the selected service was `AI-проект`.

## Verification

- `npm test -- tests/booking.test.ts tests/gallery.test.ts` — 15 passed
- `npm test` — 23 files, 91 tests passed
- `npm run build` — passed
- `git diff --check` — passed

## Commit

`Fix booking return and mobile portfolio geometry`
