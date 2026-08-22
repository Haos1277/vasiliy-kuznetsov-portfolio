# Video and AI Portfolios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the videographer page with one YouTube player and filtered work list, then reuse that player and the gallery system inside the two-mode AI creator page.

**Architecture:** YouTube metadata stays in typed data modules; production pages never store video binaries. A shared player controller validates IDs, changes one privacy-enhanced iframe only after user interaction, marks the active item, and reports failures. The AI page composes the existing gallery and video controller behind two accessible mode buttons.

**Tech Stack:** TypeScript, semantic HTML, CSS, YouTube privacy-enhanced embeds, Vitest with jsdom.

**Spec:** `docs/superpowers/specs/2026-08-22-portfolio-pages-design.md`

## Global Constraints

- Videographer filters are exactly `Все работы`, `Концерты`, and `Индивидуальные съёмки`.
- Filters never start playback; only a concrete work button loads a video.
- Advertising is not a production category until real work exists.
- AI modes are exactly `AI-фотосессии` and `Видео и анимация`.
- YouTube videos load only after user action; no local video files are added for these pages.
- Missing or invalid video entries show a readable fallback and a direct YouTube link.
- No invented titles, durations, years, or client names are added to production data.

---

### Task 1: Video data and YouTube URL validation

**Files:**
- Create: `src/data/videos.ts`
- Create: `src/lib/youtube.ts`
- Create: `tests/youtube.test.ts`

**Interfaces:**
- Produces: `type VideoCategory = 'concert' | 'individual'`.
- Produces: `type VideoWork<Category extends string = string> = { id: string; youtubeId: string; title: string; category: Category; year?: number; duration?: string }`.
- Produces: `videoWorks: readonly VideoWork<VideoCategory>[]` and `aiVideoWorks: readonly VideoWork<'ai'>[]`.
- Produces: `isYouTubeId(value: string): boolean`.
- Produces: `youtubeWatchUrl(id: string): string`.
- Produces: `youtubeEmbedUrl(id: string, autoplay?: boolean): string`.

- [ ] **Step 1: Write failing YouTube helper tests**

```ts
import { describe, expect, it } from 'vitest';
import {
  isYouTubeId,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from '../src/lib/youtube';

describe('YouTube URLs', () => {
  it('accepts only an eleven-character video ID', () => {
    expect(isYouTubeId('dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeId('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false);
    expect(isYouTubeId('bad id')).toBe(false);
  });

  it('uses privacy-enhanced embeds and explicit autoplay', () => {
    expect(youtubeEmbedUrl('dQw4w9WgXcQ', true)).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
    );
    expect(youtubeWatchUrl('dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
  });
});
```

- [ ] **Step 2: Run the helper tests and confirm the red state**

Run: `npm test -- tests/youtube.test.ts`

Expected: FAIL because `src/lib/youtube.ts` does not exist.

- [ ] **Step 3: Implement strict URL helpers**

```ts
const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;

export const isYouTubeId = (value: string): boolean =>
  youtubeIdPattern.test(value);

export const youtubeWatchUrl = (id: string): string => {
  if (!isYouTubeId(id)) throw new TypeError('Invalid YouTube video ID');
  return `https://www.youtube.com/watch?v=${id}`;
};

export const youtubeEmbedUrl = (id: string, autoplay = false): string => {
  if (!isYouTubeId(id)) throw new TypeError('Invalid YouTube video ID');
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoplay ? '1' : '0'}&rel=0`;
};
```

- [ ] **Step 4: Define truthful empty production lists**

```ts
export type VideoCategory = 'concert' | 'individual';

export type VideoWork<Category extends string = string> = {
  id: string;
  youtubeId: string;
  title: string;
  category: Category;
  year?: number;
  duration?: string;
};

export const videoWorks: readonly VideoWork<VideoCategory>[] = [];
export const aiVideoWorks: readonly VideoWork<'ai'>[] = [];
```

Real items are appended only from Vasiliy's supplied YouTube URLs and factual metadata.

- [ ] **Step 5: Run tests and commit the contracts**

Run: `npm test -- tests/youtube.test.ts`

Then:

```bash
git add src/data/videos.ts src/lib/youtube.ts tests/youtube.test.ts
git commit -m "Define YouTube portfolio contracts"
```

---

### Task 2: Shared YouTube work-list controller

**Files:**
- Create: `src/lib/video-playlist.ts`
- Create: `tests/video-playlist.test.ts`

**Interfaces:**
- Consumes: generic `VideoWork`, `youtubeEmbedUrl()`, and `youtubeWatchUrl()`.
- Produces: `type VideoFilter = 'all' | VideoCategory`.
- Produces: `filterVideoWorks(works: readonly VideoWork<VideoCategory>[], filter): readonly VideoWork<VideoCategory>[]`.
- Produces: `initVideoPlaylist<Category extends string>(root: HTMLElement, works: readonly VideoWork<Category>[]): () => void`.
- Required hooks: `[data-video-frame]`, `[data-video-filter]`, `[data-video-work]`, `[data-video-list]`, `[data-video-empty]`, `[data-video-fallback]`.

- [ ] **Step 1: Write failing filter and interaction tests**

```ts
it('filters without changing the original work order', () => {
  expect(filterVideoWorks(fixtureWorks, 'concert').map(({ id }) => id)).toEqual([
    'concert-1',
    'concert-2',
  ]);
  expect(filterVideoWorks(fixtureWorks, 'all')).toEqual(fixtureWorks);
});

it('loads only the concrete work that the visitor clicks', () => {
  const root = mountVideoFixture();
  const cleanup = initVideoPlaylist(root, fixtureWorks);
  root.querySelector<HTMLButtonElement>('[data-video-filter="concert"]')?.click();
  expect(root.querySelector<HTMLIFrameElement>('[data-video-frame]')?.src).toBe('');
  root.querySelector<HTMLButtonElement>('[data-video-work="concert-1"]')?.click();
  expect(root.querySelector<HTMLIFrameElement>('[data-video-frame]')?.src).toContain(
    '/embed/dQw4w9WgXcQ?autoplay=1',
  );
  cleanup();
});
```

- [ ] **Step 2: Run the controller tests and confirm the red state**

Run: `npm test -- tests/video-playlist.test.ts`

Expected: FAIL because the playlist controller does not exist.

- [ ] **Step 3: Implement filtering and one-player selection**

```ts
export const filterVideoWorks = (
  works: readonly VideoWork<VideoCategory>[],
  filter: VideoFilter,
): readonly VideoWork<VideoCategory>[] =>
  filter === 'all' ? works : works.filter(({ category }) => category === filter);
```

`initVideoPlaylist()` must render filtered rows with buttons, update `aria-pressed` on filters, leave the iframe `src` unset until a work click, set `src` with `youtubeEmbedUrl(id, true)`, mark one active row, update the fallback watch link, and scroll the player into view only when `matchMedia('(max-width: 820px)')` matches. It returns cleanup for every event listener.

- [ ] **Step 4: Add accessible iframe and fallback behavior**

The iframe must use a changing `title`, `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"`, `allowfullscreen`, and `referrerpolicy="strict-origin-when-cross-origin"`. An iframe error reveals `[data-video-fallback]` with the exact watch URL.

- [ ] **Step 5: Run tests and commit the shared controller**

Run:

```bash
npm test -- tests/youtube.test.ts tests/video-playlist.test.ts
git diff --check
```

Then:

```bash
git add src/lib/video-playlist.ts tests/video-playlist.test.ts
git commit -m "Add shared YouTube portfolio player"
```

---

### Task 3: Videographer page composition

**Files:**
- Modify: `src/pages/video.ts`
- Modify: `src/styles/portfolio-components.css`
- Modify: `src/styles/portfolio-layout.css`
- Create: `tests/video-page.test.ts`

**Interfaces:**
- Consumes: `renderPortfolioShell()`, `videoWorks`, and `initVideoPlaylist()`.
- Produces the visible videographer page and its approved CTA.

- [ ] **Step 1: Write the failing page-structure test**

```ts
it('renders one player, approved filters, and one work list', async () => {
  document.body.innerHTML = '<div id="app"></div>';
  await import('../src/pages/video');
  expect(document.querySelectorAll('[data-video-frame]')).toHaveLength(1);
  expect(
    [...document.querySelectorAll('[data-video-filter]')].map((item) => item.textContent?.trim()),
  ).toEqual(['Все работы', 'Концерты', 'Индивидуальные съёмки']);
  expect(document.querySelectorAll('[data-video-list]')).toHaveLength(1);
});
```

- [ ] **Step 2: Run the structure test and confirm the red state**

Run: `npm test -- tests/video-page.test.ts`

Expected: FAIL because the page contains only the foundation empty state.

- [ ] **Step 3: Render the approved player and list markup**

Create a 16:9 player frame, three filter buttons, an ordered work list, empty state, and fallback link. Use the CTA copy `Есть история, которую хочется показать в движении?` and label `Обсудить видеосъёмку`. Initialize the shared video controller.

- [ ] **Step 4: Style desktop and mobile layouts**

Keep the player visually dominant. Render list rows as 0.2 mm bordered buttons with number, title, category, optional year/duration, cyan hover, and amber active state. At mobile width, stack metadata and retain 44 px touch targets.

- [ ] **Step 5: Run regression checks and commit**

Run:

```bash
npm test -- tests/video-page.test.ts tests/video-playlist.test.ts
npm test
npm run build
```

Then:

```bash
git add src/pages/video.ts src/styles/portfolio-components.css src/styles/portfolio-layout.css tests/video-page.test.ts
git commit -m "Build videographer portfolio page"
```

---

### Task 4: AI mode state and page composition

**Files:**
- Create: `src/data/ai.ts`
- Create: `src/lib/ai-modes.ts`
- Create: `tests/ai-modes.test.ts`
- Modify: `src/pages/ai.ts`
- Modify: `src/styles/portfolio-components.css`
- Modify: `src/styles/portfolio-layout.css`

**Interfaces:**
- Consumes: shared gallery controller, `initVideoPlaylist()`, and `aiVideoWorks`.
- Produces: `type AiMode = 'photos' | 'video'`.
- Produces: `initAiModes(root: HTMLElement): () => void`.
- Produces: `aiPhotos: readonly GalleryItem[]` and one `GalleryCollection<'ai-photos'>` for the shared gallery.

- [ ] **Step 1: Write failing AI mode tests**

```ts
it('shows exactly one AI workspace at a time', () => {
  const root = mountAiFixture();
  const cleanup = initAiModes(root);
  root.querySelector<HTMLButtonElement>('[data-ai-mode="video"]')?.click();
  expect(root.querySelector('[data-ai-panel="photos"]')?.hasAttribute('hidden')).toBe(true);
  expect(root.querySelector('[data-ai-panel="video"]')?.hasAttribute('hidden')).toBe(false);
  expect(root.querySelector('[data-ai-mode="video"]')?.getAttribute('aria-pressed')).toBe('true');
  cleanup();
});
```

- [ ] **Step 2: Run the mode tests and confirm the red state**

Run: `npm test -- tests/ai-modes.test.ts`

Expected: FAIL because `initAiModes` does not exist.

- [ ] **Step 3: Implement accessible mode switching**

```ts
export type AiMode = 'photos' | 'video';

export function initAiModes(root: HTMLElement): () => void {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-ai-mode]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-ai-panel]')];
  const select = (mode: AiMode) => {
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.aiMode === mode));
    });
    panels.forEach((panel) => {
      panel.toggleAttribute('hidden', panel.dataset.aiPanel !== mode);
    });
  };
  const listeners = buttons.map((button) => {
    const handler = () => select(button.dataset.aiMode as AiMode);
    button.addEventListener('click', handler);
    return () => button.removeEventListener('click', handler);
  });
  select('photos');
  return () => listeners.forEach((cleanup) => cleanup());
}
```

- [ ] **Step 4: Define AI image data without fabricated work**

```ts
import type { GalleryCollection, GalleryItem } from '../lib/gallery-types';

export const aiPhotos: readonly GalleryItem[] = [];

export const aiPhotoCollection: GalleryCollection<'ai-photos'> = {
  id: 'ai-photos',
  title: 'AI-фотосессии',
  cardImage: 'media/ai-creator.webp',
  items: aiPhotos,
};
```

Real items are added from Vasiliy's AI image folder. Empty data renders the designed state.

- [ ] **Step 5: Compose the two-mode AI page**

Render two visual mode buttons, one gallery panel initialized with `[aiPhotoCollection]`, and one video panel using the shared player/list hooks without category filters. Initialize `initAiModes()`, `initGallery()`, and `initVideoPlaylist()` and combine all cleanup functions. Use the CTA copy `Есть идея, которую невозможно снять обычной камерой?` and label `Создать AI-проект`.

- [ ] **Step 6: Style the two cards and workspace**

Use equal 4:5 cards at desktop width and a two-column compact row on mobile. Hidden panels must use the native `hidden` attribute. The visible workspace keeps the same white frame and transition language as the photography page.

- [ ] **Step 7: Run full tests and browser verification**

Run:

```bash
npm test -- tests/ai-modes.test.ts tests/gallery.test.ts tests/video-playlist.test.ts
npm test
npm run build
git diff --check
```

Browser-check both modes at desktop and mobile widths, video selection, gallery keyboard control, empty states, focus visibility, console errors, and horizontal overflow.

- [ ] **Step 8: Commit the AI page**

```bash
git add src/data/ai.ts src/lib/ai-modes.ts tests/ai-modes.test.ts src/pages/ai.ts src/styles/portfolio-components.css src/styles/portfolio-layout.css
git commit -m "Build AI creator portfolio page"
```

---

### Task 5: Add approved YouTube works and AI media

**Files:**
- Create: `public/media/ai/cards/photos.webp`
- Create: `public/media/ai/cards/video.webp`
- Create: `public/media/ai/photos/<approved-image-files>.webp`
- Modify: `src/data/videos.ts`
- Modify: `src/data/ai.ts`
- Create: `tests/ai-data.test.ts`

**Interfaces:**
- Consumes user-supplied YouTube URLs, factual titles/categories, and the AI image source folder.
- Produces validated `videoWorks`, `aiVideoWorks`, and `aiPhotos` collections with no fictional metadata.

- [ ] **Step 1: Generate two cohesive AI mode-card images**

Use the built-in image generation tool in `stylized-concept` mode with two vertical 4:5 images sharing this art direction:

```text
Premium photorealistic editorial technology still life for Vasiliy Kuznetsov's AI portfolio, dark neutral graphite environment, controlled amber key light and cool cyan holographic accent, subtle brushed-metal texture, elegant futuristic detail, no readable text, no logos, no watermark, vertical 4:5 composition.
```

For `photos.webp`, show a camera portrait frame transforming into generative light particles. For `video.webp`, show layered cinematic frames connected by a subtle motion trail. Save optimized WebP files at the two declared paths and reference them from the AI mode buttons.

- [ ] **Step 2: Convert supplied YouTube URLs into validated data**

For every supplied URL, extract the exact 11-character video ID, run it through `isYouTubeId()`, and add the user-approved title. Videographer works receive only `concert` or `individual`; AI works receive `ai`. Add year and duration only when Vasiliy supplies or verifies them.

- [ ] **Step 3: Prepare supplied AI photographs without changing originals**

Create `-thumb.webp` files with a 640 px long side at quality 78 and `-full.webp` files with a 2200 px long side at quality 84. Remove metadata, preserve aspect ratios, store them under `public/media/ai/photos/`, and add factual Russian alt descriptions to `aiPhotos`.

- [ ] **Step 4: Add validation tests for real content**

Create `tests/ai-data.test.ts` and extend the video data tests to assert unique IDs, valid YouTube IDs, existing local image paths, positive dimensions, and absence of advertising category values. Run:

```bash
npm test -- tests/youtube.test.ts tests/ai-data.test.ts
npm test
npm run build
git diff --check
```

- [ ] **Step 5: Commit user-supplied media and metadata separately**

```bash
git add public/media/ai src/data/videos.ts src/data/ai.ts tests/ai-data.test.ts
git commit -m "Add video and AI portfolio works"
```
