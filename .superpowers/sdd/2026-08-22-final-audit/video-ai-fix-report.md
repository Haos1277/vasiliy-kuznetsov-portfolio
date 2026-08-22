# Final video/AI audit — Fix Group 2

## RED

- Zero-work playlists kept their 16:9 player visible on `/video` and the AI video panel.
- A valid selected work hid its direct YouTube URL until an iframe `error` event, which is not dependable for a cross-origin embed.
- AI mode changes and page cleanup had no playlist lifecycle operation to unload a selected iframe.

## GREEN

- A playlist with no complete works natively hides `[data-video-player]` and video filters; the designed empty state remains visible. Non-empty fixtures keep the player visible.
- Selecting a valid work immediately displays a validated `youtube.com/watch` link near the player. Synthetic iframe errors still reveal the readable fallback; malformed IDs expose neither link href and retain the unavailable message.
- `initVideoPlaylist()` now returns its callable cleanup with `stop()`. `stop()` removes the iframe source, clears active selection and watch/fallback UI. The AI photos mode calls it, and cleanup always calls it before removing listeners.

## Files

- `src/lib/video-playlist.ts`
- `src/lib/ai-modes.ts`
- `src/pages/video.ts`
- `src/pages/ai.ts`
- `src/styles/portfolio-layout.css`
- `tests/video-playlist.test.ts`
- `tests/ai-modes.test.ts`
- `tests/video-page.test.ts`
- `tests/ai-page.test.ts`

## Tests

- RED: `npm test -- tests/video-playlist.test.ts tests/ai-modes.test.ts tests/video-page.test.ts tests/ai-page.test.ts` — 6 expected failures for the three missing behaviors.
- GREEN: the same focused command — 17 passed.
- Full: `npm test` — 23 files, 94 tests passed.
- Build: `npm run build` — passed.
- Whitespace: `git diff --check` — passed.

## Browser

- `/video`: the real empty player is `hidden`, has zero client rects and no iframe `src`; filters are also hidden while the empty state has a layout box.
- `/ai`: after selecting `Видео и анимация`, its real empty player is `hidden`, has zero client rects and no iframe `src`; the empty state remains visible.
- Lifecycle behavior is covered by the composed unit fixture: select an AI work, return to photos, and return to video; the iframe source remains removed until a work is clicked again.

## Commit

`Fix video player empty states and AI cleanup`
