# Task 1 report — Music track contracts and offline waveform extraction

## RED

- `npm test -- tests/music-data.test.ts` failed as expected before implementation: Vite could not resolve `../src/data/music`.
- After adding the real CLI contract, `npm test -- tests/music-data.test.ts tests/audio-peaks.test.ts` also failed as expected: the absent extractor exited with status 1 rather than printing a peak array.

## GREEN

- Added the shared `MusicTrack` contract and one factual, typed DJ_Schmied track.
- Added a deterministic `ffmpeg` extractor: mono 8 kHz float32 PCM is bucketed by maximum absolute amplitude, globally normalized, rounded to three decimals, and emitted as one JSON array.
- The CLI exits nonzero with no stdout for missing arguments, invalid bucket counts, decoder failures, and empty PCM output.
- Node's default synchronous child-process buffer was insufficient for this 8.9 MB PCM stream; the extractor uses a 16 MiB explicit buffer so the factual source can be processed completely.

## Actual source data

- MP3: `public/media/dj-schmied-storm.mp3`
- Track ID: `storm-covers-the-sky`
- Title: `A storm covers the sky with darkness`
- Artist: `DJ_Schmied`
- Source: `media/dj-schmied-storm.mp3`
- Literal `ffprobe` duration: `278.280000`
- Literal normalized peak count: `192`
- Independent clean-process extraction comparison: duration difference `0`, maximum peak difference `0` (tolerance `1e-9`).

## Files

- `src/lib/music-types.ts`
- `src/data/music.ts`
- `scripts/audio-peaks.mjs`
- `tests/music-data.test.ts`
- `tests/audio-peaks.test.ts`
- `.superpowers/sdd/2026-08-22-music-portfolio/task-1-report.md`

## Tests and verification

| Command / check | Result |
| --- | --- |
| `npm test -- tests/music-data.test.ts` (RED) | Failed: missing data module. |
| `npm test -- tests/music-data.test.ts tests/audio-peaks.test.ts` (GREEN) | Passed: 2 files, 4 tests. |
| Clean-process extraction and literal comparison | Passed: 278.28 seconds, 192 peaks, exact numeric match within `1e-9`. |
| CLI invalid-input checks | Missing arguments, nonexistent input, and zero buckets each exited `1` with empty stdout. |
| `npm test` | Passed: 19 files, 55 tests. |
| `npm run build` | Passed: TypeScript and Vite production build. |
| `git diff --check` | Passed with no whitespace errors. |

## Commit

`Define music tracks and waveform data` — scoped Task 1 commit.

## Self-review

- The production list contains exactly one existing factual MP3; no placeholder tracks or invented metadata were added.
- The record uses the exact required ID, title, artist, base-relative source path, literal duration, and literal 192 extraction values.
- The extractor rejects invalid invocation and decoder failures without mixing diagnostics into JSON stdout.
- The data list is readonly and limited by the supplied test to at most 15 tracks.
- `progress.md` was intentionally left unchanged.

## DONE-BLOCKED

DONE: Task 1 data, extraction tooling, TDD evidence, focused/full tests, production build, diff check, and scoped commit are complete.

BLOCKED: none.
