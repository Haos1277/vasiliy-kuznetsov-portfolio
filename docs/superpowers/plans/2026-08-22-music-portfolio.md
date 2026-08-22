# DJ Schmied Music Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 15-track-capable DJ_Schmied page with one shared cover, responsive playlist controls, accurate time/seek behavior, and a lightweight interactive waveform.

**Architecture:** Track metadata and precomputed waveform peaks live in a typed data module. Pure state functions own current index, repeat mode, shuffle, and next/previous decisions; a DOM controller synchronizes one HTMLAudioElement, controls, playlist rows, range inputs, and requestAnimationFrame progress. Waveform drawing uses compact peak data and Canvas, so phones never decode full MP3 files for visualization.

**Tech Stack:** TypeScript, HTMLAudioElement, Canvas 2D, Pointer Events, CSS, Vitest with jsdom, ffmpeg for offline peak extraction.

**Spec:** `docs/superpowers/specs/2026-08-22-portfolio-pages-design.md`

## Global Constraints

- The page supports 15 tracks and uses one common DJ_Schmied cover.
- Only factual user-supplied track titles and MP3 files appear in production data.
- Audio never starts before an explicit user action.
- Only the selected track receives an audio source; the remaining MP3 files are not preloaded.
- Controls include play/pause, previous, next, elapsed/duration, seek, waveform seek, volume, shuffle, repeat one, and repeat all.
- Waveform progress is amber; idle waveform and frames follow the current white/graphite design.
- Mobile keeps play, previous/next, time, seek, and waveform visible; volume moves into a secondary panel.

---

### Task 1: Track contracts and offline waveform extraction

**Files:**
- Create: `src/data/music.ts`
- Create: `src/lib/music-types.ts`
- Create: `scripts/audio-peaks.mjs`
- Create: `tests/music-data.test.ts`

**Interfaces:**
- Produces: `type MusicTrack = { id: string; title: string; artist: 'DJ_Schmied'; src: string; duration: number; peaks: readonly number[] }`.
- Produces: `musicTracks: readonly MusicTrack[]` with at most 15 items.
- Produces CLI: `node scripts/audio-peaks.mjs <mp3-path> <bucket-count>` prints normalized JSON peaks.

- [ ] **Step 1: Write failing track-data tests**

```ts
import { describe, expect, it } from 'vitest';
import { musicTracks } from '../src/data/music';

describe('music data', () => {
  it('uses one artist and never exceeds the approved first-version limit', () => {
    expect(musicTracks.length).toBeLessThanOrEqual(15);
    expect(musicTracks.every(({ artist }) => artist === 'DJ_Schmied')).toBe(true);
  });

  it('stores normalized waveform peaks for every real track', () => {
    for (const track of musicTracks) {
      expect(track.peaks.length).toBe(192);
      expect(track.peaks.every((peak) => peak >= 0 && peak <= 1)).toBe(true);
      expect(track.duration).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run the data tests and confirm the red state**

Run: `npm test -- tests/music-data.test.ts`

Expected: FAIL because music data does not exist.

- [ ] **Step 3: Implement the shared track type**

```ts
export type MusicTrack = {
  id: string;
  title: string;
  artist: 'DJ_Schmied';
  src: string;
  duration: number;
  peaks: readonly number[];
};
```

- [ ] **Step 4: Implement deterministic peak extraction**

`scripts/audio-peaks.mjs` must use `spawnSync('ffmpeg', ['-v', 'error', '-i', input, '-ac', '1', '-ar', '8000', '-f', 'f32le', 'pipe:1'])`, interpret stdout as little-endian float32 PCM, split samples into the requested bucket count, compute the maximum absolute sample per bucket, normalize by the global maximum, round to three decimals, and print exactly one JSON array. It must reject missing arguments, a non-positive bucket count, ffmpeg failures, and empty PCM output with a nonzero exit code.

- [ ] **Step 5: Generate peaks for the existing real track**

Run:

```bash
node scripts/audio-peaks.mjs public/media/dj-schmied-storm.mp3 192
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 public/media/dj-schmied-storm.mp3
```

Copy the command's complete 192-number JSON array and `ffprobe` numeric duration into one literal `MusicTrack` record with id `storm-covers-the-sky`, title `A storm covers the sky with darkness`, artist `DJ_Schmied`, and source `media/dj-schmied-storm.mp3`. The source file must contain only literal numbers returned by the commands, not symbolic stand-ins.

- [ ] **Step 6: Run tests and commit data tooling**

Run: `npm test -- tests/music-data.test.ts`

Then:

```bash
git add src/lib/music-types.ts src/data/music.ts scripts/audio-peaks.mjs tests/music-data.test.ts
git commit -m "Define music tracks and waveform data"
```

---

### Task 2: Pure playlist state

**Files:**
- Create: `src/lib/playlist-state.ts`
- Create: `tests/playlist-state.test.ts`

**Interfaces:**
- Produces: `type RepeatMode = 'off' | 'all' | 'one'`.
- Produces: `type PlaylistState = { index: number; playing: boolean; shuffle: boolean; repeat: RepeatMode }`.
- Produces: `createPlaylistState(): PlaylistState`.
- Produces: `selectTrack(state, index, length): PlaylistState`.
- Produces: `nextTrack(state, length, random): PlaylistState`.
- Produces: `previousTrack(state, length): PlaylistState`.
- Produces: `cycleRepeat(state): PlaylistState` and `toggleShuffle(state): PlaylistState`.

- [ ] **Step 1: Write failing state-transition tests**

```ts
it('advances and wraps only when repeat all is active', () => {
  const base = { ...createPlaylistState(), index: 2, playing: true };
  expect(nextTrack(base, 3, () => 0).playing).toBe(false);
  expect(nextTrack({ ...base, repeat: 'all' }, 3, () => 0).index).toBe(0);
});

it('keeps the same track for repeat one', () => {
  const state = { ...createPlaylistState(), index: 1, repeat: 'one' as const };
  expect(nextTrack(state, 3, () => 0).index).toBe(1);
});

it('uses the injected random source while shuffle is active', () => {
  const state = { ...createPlaylistState(), index: 0, shuffle: true };
  expect(nextTrack(state, 4, () => 0.75).index).toBe(3);
});
```

- [ ] **Step 2: Run state tests and confirm the red state**

Run: `npm test -- tests/playlist-state.test.ts`

Expected: FAIL because the playlist state module does not exist.

- [ ] **Step 3: Implement immutable player transitions**

Implement bounds checking for empty playlists and invalid indices. `cycleRepeat()` must rotate `off → all → one → off`. `selectTrack()` sets `playing: true`. `previousTrack()` wraps to the final item only when repeat all is active; otherwise index zero stays at zero. `nextTrack()` uses the injected `random(): number` only when shuffle is true and clamps its result to the available indices.

- [ ] **Step 4: Run tests and commit pure state**

Run: `npm test -- tests/playlist-state.test.ts`

Then:

```bash
git add src/lib/playlist-state.ts tests/playlist-state.test.ts
git commit -m "Add music playlist state"
```

---

### Task 3: Waveform renderer

**Files:**
- Create: `src/lib/waveform.ts`
- Create: `tests/waveform.test.ts`

**Interfaces:**
- Produces: `progressFromPointer(clientX: number, rect: Pick<DOMRect, 'left' | 'width'>): number`.
- Produces: `drawWaveform(canvas: HTMLCanvasElement, peaks: readonly number[], progress: number): void`.
- Produces: `bindWaveformSeek(canvas, onSeek): () => void`.

- [ ] **Step 1: Write failing pointer normalization tests**

```ts
it('normalizes and clamps a pointer position', () => {
  const rect = { left: 100, width: 400 };
  expect(progressFromPointer(300, rect)).toBe(0.5);
  expect(progressFromPointer(0, rect)).toBe(0);
  expect(progressFromPointer(700, rect)).toBe(1);
});
```

- [ ] **Step 2: Run tests and confirm the red state**

Run: `npm test -- tests/waveform.test.ts`

Expected: FAIL because waveform helpers do not exist.

- [ ] **Step 3: Implement high-DPI waveform drawing**

Resize the canvas backing store to `clientWidth * devicePixelRatio` by `clientHeight * devicePixelRatio`, clear it, and draw symmetrical vertical bars for each peak. Bars before `Math.round(peaks.length * progress)` use amber `#f3a24a`; remaining bars use translucent paper white. Clamp `progress` to `[0, 1]` and return without throwing for an empty peak array or zero-size canvas.

- [ ] **Step 4: Implement pointer seeking**

Bind `pointerdown` and pointer movement while captured. Every position calls `onSeek(progressFromPointer(event.clientX, canvas.getBoundingClientRect()))`. Add keyboard handling for ArrowLeft and ArrowRight in the audio controller through the semantic range input rather than making Canvas the only accessible seek control.

- [ ] **Step 5: Run tests and commit waveform utilities**

Run: `npm test -- tests/waveform.test.ts`

Then:

```bash
git add src/lib/waveform.ts tests/waveform.test.ts
git commit -m "Add interactive audio waveform"
```

---

### Task 4: Audio player controller

**Files:**
- Create: `src/lib/music-player.ts`
- Create: `tests/music-player.test.ts`

**Interfaces:**
- Consumes: `MusicTrack`, playlist state functions, `withBase()`, `drawWaveform()`, and `bindWaveformSeek()`.
- Produces: `initMusicPlayer(root: HTMLElement, tracks: readonly MusicTrack[]): () => void`.
- Required hooks: `[data-music-audio]`, `[data-music-play]`, `[data-music-prev]`, `[data-music-next]`, `[data-music-seek]`, `[data-music-waveform]`, `[data-music-volume]`, `[data-music-shuffle]`, `[data-music-repeat]`, `[data-music-current]`, `[data-music-duration]`, `[data-music-title]`, `[data-music-track]`, `[data-music-error]`.

- [ ] **Step 1: Write failing controller tests**

```ts
it('loads only the selected track and synchronizes seek time', async () => {
  const root = mountMusicFixture();
  const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
  audio.play = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(audio, 'duration', { configurable: true, value: 240 });
  const cleanup = initMusicPlayer(root, fixtureTracks);
  root.querySelector<HTMLButtonElement>('[data-music-track="track-2"]')?.click();
  expect(audio.src).toContain('track-2.mp3');
  const seek = root.querySelector<HTMLInputElement>('[data-music-seek]')!;
  seek.value = '0.5';
  seek.dispatchEvent(new Event('input'));
  expect(audio.currentTime).toBe(120);
  cleanup();
});

it('shows a recoverable error when audio playback rejects', async () => {
  const root = mountMusicFixture();
  const audio = root.querySelector<HTMLAudioElement>('[data-music-audio]')!;
  audio.play = vi.fn().mockRejectedValue(new Error('blocked'));
  initMusicPlayer(root, fixtureTracks);
  root.querySelector<HTMLButtonElement>('[data-music-play]')?.click();
  await Promise.resolve();
  expect(root.querySelector('[data-music-error]')?.hasAttribute('hidden')).toBe(false);
});
```

- [ ] **Step 2: Run controller tests and confirm the red state**

Run: `npm test -- tests/music-player.test.ts`

Expected: FAIL because the music controller does not exist.

- [ ] **Step 3: Implement audio synchronization**

On selection, set `audio.src = withBase(track.src)`, update metadata and waveform, then call `audio.play()` from the click handler. Use `loadedmetadata`, `timeupdate`, `play`, `pause`, `ended`, `volumechange`, and `error` listeners. The range input uses values from `0` to `1` with step `0.001`; its input handler sets `audio.currentTime = progress * audio.duration` only for finite positive duration.

Use one requestAnimationFrame loop only while playing to draw smoother progress. Cancel it on pause, error, track change, and cleanup. `ended` delegates to `nextTrack()` and respects repeat/shuffle. Volume input sets `audio.volume`. Update all `aria-pressed`, button labels, formatted `MM:SS` values, active rows, and the error region after each state change.

- [ ] **Step 4: Run focused tests and commit the controller**

Run:

```bash
npm test -- tests/playlist-state.test.ts tests/waveform.test.ts tests/music-player.test.ts
git diff --check
```

Then:

```bash
git add src/lib/music-player.ts tests/music-player.test.ts
git commit -m "Build advanced music player controller"
```

---

### Task 5: Music page composition and responsive design

**Files:**
- Modify: `src/pages/music.ts`
- Modify: `src/styles/portfolio-components.css`
- Modify: `src/styles/portfolio-layout.css`
- Modify: `src/styles/portfolio-motion.css`
- Create: `tests/music-page.test.ts`

**Interfaces:**
- Consumes: `renderPortfolioShell()`, `musicTracks`, and `initMusicPlayer()`.
- Produces the complete DJ_Schmied page and approved CTA.

- [ ] **Step 1: Write the failing page-structure test**

```ts
it('renders one audio element, waveform, controls, and shared cover', async () => {
  document.body.innerHTML = '<div id="app"></div>';
  await import('../src/pages/music');
  expect(document.querySelectorAll('[data-music-audio]')).toHaveLength(1);
  expect(document.querySelectorAll('[data-music-waveform]')).toHaveLength(1);
  expect(document.querySelector('[data-music-play]')).not.toBeNull();
  expect(document.querySelector('[data-music-seek]')).not.toBeNull();
  expect(document.querySelector<HTMLImageElement>('.music-player__cover')?.src).toContain(
    '/media/music.webp',
  );
});
```

- [ ] **Step 2: Run the structure test and confirm the red state**

Run: `npm test -- tests/music-page.test.ts`

Expected: FAIL because the music page contains only the foundation empty state.

- [ ] **Step 3: Render the complete player and playlist**

Render one common cover, title/artist region, Canvas waveform, semantic range seek input with accessible label, time values, primary transport buttons, shuffle/repeat buttons, volume panel, live error region, and one button row per factual track. Use `preload="none"` on the single audio element. Initialize `initMusicPlayer()` after shell rendering.

Use CTA copy `Вашему проекту нужен собственный звук?` and label `Обсудить музыку`.

- [ ] **Step 4: Implement visual hierarchy and reduced motion**

At desktop width, place cover and player side by side with the playlist beneath. On mobile, stack them, keep transport controls and waveform visible, and collapse volume into a `<details>` element. Animate the cover with a low-amplitude scale/glow only while `.is-playing` is present. Disable that animation under reduced motion.

- [ ] **Step 5: Run complete verification**

Run:

```bash
npm test -- tests/music-page.test.ts tests/music-player.test.ts tests/music-data.test.ts
npm test
npm run build
git diff --check
```

Browser-check play/pause, exact seek, waveform click and drag, previous/next, shuffle, all repeat modes, volume, track switching, one-network-request-at-a-time behavior, mobile controls, keyboard focus, console errors, and horizontal overflow.

- [ ] **Step 6: Commit the music page**

```bash
git add src/pages/music.ts src/styles/portfolio-components.css src/styles/portfolio-layout.css src/styles/portfolio-motion.css tests/music-page.test.ts
git commit -m "Build DJ Schmied music portfolio"
```

---

### Task 6: Add the remaining user-supplied tracks and publish

**Files:**
- Create: `public/media/music/<approved-track-files>.mp3`
- Modify: `src/data/music.ts`

**Interfaces:**
- Consumes the user-supplied folder of MP3 files and factual titles.
- Produces a maximum of 15 valid `MusicTrack` records with 192 peaks each.

- [ ] **Step 1: Copy approved MP3 files without modifying Desktop originals**

Normalize destination filenames to lowercase ASCII kebab-case, keep original audio encoding unless a file exceeds 15 МБ, and store each file under `public/media/music/`. Never overwrite the existing source files.

- [ ] **Step 2: Measure every duration and generate every peak array**

For each copied file, run `ffprobe` for duration and `node scripts/audio-peaks.mjs <file> 192` for peaks. Add the exact returned values and user-approved title to `src/data/music.ts`. Reject duplicate IDs and stop at 15 items.

- [ ] **Step 3: Verify data, build size, and playback**

Run:

```bash
npm test -- tests/music-data.test.ts tests/music-player.test.ts
npm run build
du -sh dist
git diff --check
```

Expected: tests and build pass, `dist` remains below the 1 ГБ GitHub Pages limit, and only the selected MP3 downloads during browser inspection.

- [ ] **Step 4: Commit supplied audio separately**

```bash
git add public/media/music src/data/music.ts
git commit -m "Add DJ Schmied track collection"
```

- [ ] **Step 5: Push and verify GitHub Pages**

Push `main`, watch the Pages workflow to successful completion, open all five public URLs, and verify no failed network requests or console errors.
