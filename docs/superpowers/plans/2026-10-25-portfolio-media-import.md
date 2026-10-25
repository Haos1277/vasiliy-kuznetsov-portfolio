# Portfolio Media Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish every supported item from `/Users/vasiliy/Desktop/Медиа` in the matching photography, video, AI, or music portfolio section without placing multi-gigabyte originals in GitHub Pages.

**Architecture:** Keep optimized photographs, AI images, audio tracks, and video posters in `public/media`. Transcode the 38 source videos to browser-compatible H.264/AAC files and publish them as assets on a dedicated GitHub Release; extend the existing playlist to support both YouTube embeds and direct video URLs. Generate stable ASCII filenames and explicit TypeScript data entries so the static site remains deterministic.

**Tech Stack:** Vite, TypeScript, Vitest, ffmpeg/ffprobe, GitHub Pages, GitHub Releases.

**Spec:** `docs/superpowers/specs/2026-08-22-portfolio-pages-design.md`

## Global Constraints

- Do not alter or delete the source folder on the Desktop.
- Do not commit any original multi-gigabyte video source.
- Keep each published release asset below GitHub's per-file limit.
- Preserve the existing YouTube path while adding direct-file playback.
- Use web-safe ASCII slugs for every published filename.
- Do not include the pre-existing unstaged `package-lock.json` change in the media commit.

## Review Focus

- Direct and YouTube video items select the correct player without leaving the other player active.
- Stopping or switching an AI mode pauses and unloads direct video.
- Empty photography categories remain usable alongside populated categories.
- Every generated image path exists and has positive dimensions.
- Every audio track has a real duration and 192 normalized waveform peaks.

---

### Task 1: Support direct video assets

**Files:**
- Modify: `src/data/videos.ts`
- Modify: `src/lib/video-playlist.ts`
- Modify: `src/pages/video.ts`
- Modify: `src/pages/ai.ts`
- Modify: `src/styles/portfolio-layout.css`
- Test: `tests/video-playlist.test.ts`
- Test: `tests/video-page.test.ts`
- Test: `tests/ai-page.test.ts`

**Interfaces:**
- Consumes: existing `VideoWork`, `initVideoPlaylist`, and YouTube helpers.
- Produces: video records with either `youtubeId` or `src`, plus one native `<video data-video-native>` player per page.

- [ ] Write failing tests for direct selection, source switching, errors, and stop/cleanup.
- [ ] Run the focused tests and verify they fail because direct playback is absent.
- [ ] Add the direct-video fields, markup, controller branch, and shared player styling.
- [ ] Run the focused tests and full suite.

### Task 2: Import photography and AI images

**Files:**
- Create: `public/media/photography/{studio,wedding,nha-trang}/{thumb,full}/*.webp`
- Create: `public/media/ai/photos/{thumb,full}/*.webp`
- Modify: `src/data/photography.ts`
- Modify: `src/data/ai.ts`
- Test: `tests/photography-data.test.ts`
- Test: `tests/ai-data.test.ts`

**Interfaces:**
- Consumes: source folders `Студийная`, `Свадебная`, `Нячанг`, and `Нейрофотосессия`.
- Produces: complete `GalleryItem` records and a new `nha-trang` photography category.

- [ ] Write failing data-integrity tests for category counts, file existence, and dimensions.
- [ ] Run them and verify the empty data fails.
- [ ] Generate WebP thumbnails/full images and explicit data entries.
- [ ] Run focused tests and inspect representative outputs.

### Task 3: Import the music catalog

**Files:**
- Create: `public/media/music/tracks/*.mp3`
- Modify: `src/data/music.ts`
- Test: `tests/music-data.test.ts`

**Interfaces:**
- Consumes: all 12 MP3 files from `Мои треки`.
- Produces: 12 `MusicTrack` entries with durations and 192 waveform peaks.

- [ ] Write a failing test for the complete catalog and referenced files.
- [ ] Run it and verify the one-track catalog fails.
- [ ] Copy normalized files and generate metadata with ffprobe/audio-peaks.
- [ ] Run focused player and data tests.

### Task 4: Transcode and publish the video catalog

**Files:**
- Create: `work/media-release/*.mp4` outside the repository.
- Create: `public/media/video/posters/*.webp`
- Create: `public/media/ai/video-posters/*.webp`
- Modify: `src/data/videos.ts`
- Test: `tests/video-page.test.ts`
- Test: `tests/ai-data.test.ts`

**Interfaces:**
- Consumes: 23 files from `видео` and 15 files from `AI video`.
- Produces: browser-ready release assets, posters, titles, durations, and stable public URLs.

- [ ] Add failing catalog tests for all 38 works and their playback URLs.
- [ ] Transcode to H.264/AAC with fast-start metadata and validate every output with ffprobe.
- [ ] Generate posters and populate direct-media records.
- [ ] Create the GitHub Release and upload all transcoded assets.
- [ ] Verify the release URLs return playable media.

### Task 5: Verify and publish GitHub Pages

**Files:**
- Modify: generated media/data/tests from Tasks 1-4.
- Preserve: unrelated `package-lock.json` worktree change.

**Interfaces:**
- Consumes: completed media catalogs and release URLs.
- Produces: one media-import commit on `main` and a successful Pages deployment.

- [ ] Run `npm test` and confirm zero failures.
- [ ] Run `npm run build` and confirm success.
- [ ] Verify generated site size and all local media references.
- [ ] Commit only the media-import files and push `main`.
- [ ] Wait for the Pages workflow and inspect the live photography, video, AI, and music pages.
