# Photography Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the photography page with four isolated category cards, a swipeable gallery, remembered per-category positions, and an accessible fullscreen viewer.

**Architecture:** Production content is defined in a typed data module with one array per physical media folder. A pure gallery state module owns category/index transitions; a DOM controller renders only the active collection and preloads only neighboring images. The same controller owns keyboard, pointer, swipe, and lightbox behavior.

**Tech Stack:** TypeScript, semantic HTML, CSS, Pointer Events, HTMLImageElement, Vitest with jsdom, WebP assets.

**Spec:** `docs/superpowers/specs/2026-08-22-portfolio-pages-design.md`

## Global Constraints

- Category order and labels are exactly: Студийная съёмка, Свадебная съёмка, Предметная съёмка, Концертная съёмка.
- A gallery never advances into another category.
- Original source photographs are never modified or deleted.
- Production images use category-specific folders under `public/media/photography/`.
- Only active and neighboring frames are requested by the browser.
- Gallery and lightbox are fully keyboard accessible and respect reduced motion.
- Missing collections show a designed empty state and do not invent sample work.

---

### Task 1: Typed photography collections

**Files:**
- Create: `src/lib/gallery-types.ts`
- Create: `src/data/photography.ts`
- Create: `tests/photography-data.test.ts`
- Create: `public/media/photography/studio/.gitkeep`
- Create: `public/media/photography/wedding/.gitkeep`
- Create: `public/media/photography/product/.gitkeep`
- Create: `public/media/photography/concert/.gitkeep`

**Interfaces:**
- Produces: `type PhotoCategoryId = 'studio' | 'wedding' | 'product' | 'concert'`.
- Produces: `type GalleryItem = { id: string; thumbnail: string; full: string; alt: string; width: number; height: number }`.
- Produces: `type GalleryCollection<Id extends string> = { id: Id; title: string; cardImage: string; items: readonly GalleryItem[] }`.
- Produces: `type PhotoItem = GalleryItem` and `type PhotoCategory = GalleryCollection<PhotoCategoryId>`.
- Produces: `photographyCategories: readonly PhotoCategory[]`.

- [ ] **Step 1: Write the failing data contract tests**

```ts
import { describe, expect, it } from 'vitest';
import { photographyCategories } from '../src/data/photography';

describe('photography data', () => {
  it('keeps the four approved collections in order', () => {
    expect(photographyCategories.map(({ id }) => id)).toEqual([
      'studio',
      'wedding',
      'product',
      'concert',
    ]);
  });

  it('keeps every image inside its category folder', () => {
    for (const category of photographyCategories) {
      for (const item of category.items) {
        expect(item.thumbnail).toContain(`/photography/${category.id}/`);
        expect(item.full).toContain(`/photography/${category.id}/`);
      }
    }
  });
});
```

- [ ] **Step 2: Run the data tests and confirm the red state**

Run: `npm test -- tests/photography-data.test.ts`

Expected: FAIL because the photography data module does not exist.

- [ ] **Step 3: Implement the collection types and approved empty collections**

```ts
import type { GalleryCollection, GalleryItem } from '../lib/gallery-types';

export type PhotoCategoryId = 'studio' | 'wedding' | 'product' | 'concert';

export type PhotoItem = GalleryItem;

export type PhotoCategory = GalleryCollection<PhotoCategoryId>;
```

Create `src/lib/gallery-types.ts` with:

```ts
export type GalleryItem = {
  id: string;
  thumbnail: string;
  full: string;
  alt: string;
  width: number;
  height: number;
};

export type GalleryCollection<Id extends string> = {
  id: Id;
  title: string;
  cardImage: string;
  items: readonly GalleryItem[];
};
```

Then define the photography data:

```ts
export const photographyCategories = [
  { id: 'studio', title: 'Студийная съёмка', cardImage: 'media/photography/cards/studio.webp', items: [] },
  { id: 'wedding', title: 'Свадебная съёмка', cardImage: 'media/photography/cards/wedding.webp', items: [] },
  { id: 'product', title: 'Предметная съёмка', cardImage: 'media/photography/cards/product.webp', items: [] },
  { id: 'concert', title: 'Концертная съёмка', cardImage: 'media/photography/cards/concert.webp', items: [] },
] as const satisfies readonly PhotoCategory[];
```

Empty arrays are intentional until Vasiliy supplies the four source folders. They must render the approved empty state.

- [ ] **Step 4: Run the data tests**

Run: `npm test -- tests/photography-data.test.ts`

Expected: 2 passing tests.

- [ ] **Step 5: Commit the collection contract**

```bash
git add src/lib/gallery-types.ts src/data/photography.ts tests/photography-data.test.ts public/media/photography/studio/.gitkeep public/media/photography/wedding/.gitkeep public/media/photography/product/.gitkeep public/media/photography/concert/.gitkeep
git commit -m "Define photography collections"
```

---

### Task 2: Pure gallery state

**Files:**
- Create: `src/lib/gallery-state.ts`
- Create: `tests/gallery-state.test.ts`

**Interfaces:**
- Consumes: a non-empty ordered collection-ID tuple and collection lengths.
- Produces: `type GalleryState<Id extends string> = { activeCategory: Id; indexByCategory: Record<Id, number>; lightboxOpen: boolean }`.
- Produces: `createGalleryState(ids, initialCategory): GalleryState<Id>`.
- Produces: `selectCategory(state, category): GalleryState`.
- Produces: `moveFrame(state, direction, length): GalleryState`.
- Produces: `openLightbox(state): GalleryState` and `closeLightbox(state): GalleryState`.

- [ ] **Step 1: Write failing isolation and boundary tests**

```ts
import { describe, expect, it } from 'vitest';
import {
  createGalleryState,
  moveFrame,
  selectCategory,
} from '../src/lib/gallery-state';

describe('gallery state', () => {
  it('wraps only inside the active collection', () => {
    let state = createGalleryState(
      ['studio', 'wedding', 'product', 'concert'] as const,
      'wedding',
    );
    state = moveFrame(state, -1, 5);
    expect(state.activeCategory).toBe('wedding');
    expect(state.indexByCategory.wedding).toBe(4);
  });

  it('remembers a separate index for each category', () => {
    let state = createGalleryState(
      ['studio', 'wedding', 'product', 'concert'] as const,
      'studio',
    );
    state = moveFrame(state, 1, 4);
    state = selectCategory(state, 'concert');
    state = moveFrame(state, 1, 3);
    state = selectCategory(state, 'studio');
    expect(state.indexByCategory.studio).toBe(1);
    expect(state.indexByCategory.concert).toBe(1);
  });

  it('does not move an empty collection', () => {
    const state = createGalleryState(
      ['studio', 'wedding', 'product', 'concert'] as const,
      'product',
    );
    expect(moveFrame(state, 1, 0)).toEqual(state);
  });
});
```

- [ ] **Step 2: Run the state tests and confirm the red state**

Run: `npm test -- tests/gallery-state.test.ts`

Expected: FAIL because the gallery state module does not exist.

- [ ] **Step 3: Implement immutable gallery transitions**

```ts
export const createGalleryState = <Id extends string>(
  ids: readonly [Id, ...Id[]],
  initialCategory: Id = ids[0],
): GalleryState<Id> => ({
  activeCategory: initialCategory,
  indexByCategory: Object.fromEntries(ids.map((id) => [id, 0])) as Record<Id, number>,
  lightboxOpen: false,
});

export const selectCategory = <Id extends string>(
  state: GalleryState<Id>,
  activeCategory: Id,
): GalleryState<Id> => ({ ...state, activeCategory, lightboxOpen: false });

export const moveFrame = <Id extends string>(
  state: GalleryState<Id>,
  direction: -1 | 1,
  length: number,
): GalleryState<Id> => {
  if (length === 0) return state;
  const current = state.indexByCategory[state.activeCategory];
  const next = (current + direction + length) % length;
  return {
    ...state,
    indexByCategory: { ...state.indexByCategory, [state.activeCategory]: next },
  };
};
```

Implement `openLightbox` and `closeLightbox` as immutable boolean transitions.

- [ ] **Step 4: Run the gallery state tests**

Run: `npm test -- tests/gallery-state.test.ts`

Expected: 3 passing tests.

- [ ] **Step 5: Commit pure gallery state**

```bash
git add src/lib/gallery-state.ts tests/gallery-state.test.ts
git commit -m "Add isolated gallery state"
```

---

### Task 3: Gallery DOM controller and lightbox

**Files:**
- Create: `src/lib/gallery.ts`
- Create: `tests/gallery.test.ts`
- Modify: `src/pages/photography.ts`
- Modify: `src/styles/portfolio-components.css`
- Modify: `src/styles/portfolio-layout.css`
- Modify: `src/styles/portfolio-motion.css`

**Interfaces:**
- Consumes: `GalleryCollection`, `photographyCategories`, and generic gallery state functions.
- Produces: `initGallery<Id extends string>(root: HTMLElement, categories: readonly [GalleryCollection<Id>, ...GalleryCollection<Id>[]]): () => void`.
- Required hooks: `[data-gallery-category]`, `[data-gallery-image]`, `[data-gallery-prev]`, `[data-gallery-next]`, `[data-gallery-count]`, `[data-gallery-empty]`, `[data-lightbox]`, `[data-lightbox-close]`.

- [ ] **Step 1: Write failing DOM behavior tests**

```ts
it('renders only the active category and keeps categories isolated', () => {
  const root = mountGalleryFixture();
  const cleanup = initGallery(root, fixtureCategories);
  root.querySelector<HTMLButtonElement>('[data-gallery-category="wedding"]')?.click();
  expect(root.querySelector<HTMLImageElement>('[data-gallery-image]')?.alt).toBe(
    'Wedding one',
  );
  root.querySelector<HTMLButtonElement>('[data-gallery-next]')?.click();
  expect(root.querySelector<HTMLImageElement>('[data-gallery-image]')?.alt).toBe(
    'Wedding two',
  );
  expect(root.textContent).not.toContain('Studio two');
  cleanup();
});

it('opens and closes the lightbox with Escape', () => {
  const root = mountGalleryFixture();
  const cleanup = initGallery(root, fixtureCategories);
  root.querySelector<HTMLButtonElement>('[data-gallery-open]')?.click();
  expect(root.querySelector('[data-lightbox]')?.getAttribute('aria-hidden')).toBe('false');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(root.querySelector('[data-lightbox]')?.getAttribute('aria-hidden')).toBe('true');
  cleanup();
});
```

The fixture must contain two categories with two local data-URL images each and the exact required hooks.

- [ ] **Step 2: Run the DOM tests and confirm the red state**

Run: `npm test -- tests/gallery.test.ts`

Expected: FAIL because `initGallery` does not exist.

- [ ] **Step 3: Implement rendering and input handling**

`initGallery()` must:

```ts
const render = () => {
  const category = categories.find(({ id }) => id === state.activeCategory);
  if (!category) return;
  const index = state.indexByCategory[category.id];
  const item = category.items[index];
  root.dataset.activeCategory = category.id;
  root.querySelectorAll<HTMLButtonElement>('[data-gallery-category]').forEach((button) => {
    const active = button.dataset.galleryCategory === category.id;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderCurrentImage(item, index, category.items.length);
};
```

Bind category buttons, previous/next buttons, ArrowLeft/ArrowRight/Escape, pointer drag with a 48 px threshold, lightbox open/close, focus return, and cleanup of every listener. `renderCurrentImage()` must show the empty-state element when `item` is undefined; otherwise it sets `src`, `alt`, intrinsic dimensions, counter text, and preloads only the adjacent `full` URLs with `new Image()`.

- [ ] **Step 4: Render the photography page markup**

Build the category rail from `photographyCategories`. Each button contains the card image, category title, and `aria-pressed`. Add one gallery stage with image button, arrows, count, empty state, and a `role="dialog" aria-modal="true"` lightbox. Pass the complete markup to `renderPortfolioShell()` and call `initGallery()` after rendering.

- [ ] **Step 5: Add responsive and motion styles**

At desktop widths, use a two-column grid with a narrow vertical category rail and a large 4:5-capable gallery stage. At 820 px and below, make the rail a horizontal scroll-snap row and keep touch targets at least 44 px. Use opacity/translate transitions for frame changes, disable them under reduced motion, and preserve the approved white border and subtle glow.

- [ ] **Step 6: Run focused and full verification**

Run:

```bash
npm test -- tests/gallery-state.test.ts tests/gallery.test.ts
npm test
npm run build
git diff --check
```

Expected: all tests pass and all pages build.

- [ ] **Step 7: Browser-check desktop and mobile behavior**

Verify category isolation, wrapping, remembered positions, mouse drag, touch-width layout, keyboard arrows, Escape, focus return, empty state, no console errors, and no horizontal overflow.

- [ ] **Step 8: Commit the photography experience**

```bash
git add src/lib/gallery.ts tests/gallery.test.ts src/pages/photography.ts src/styles/portfolio-components.css src/styles/portfolio-layout.css src/styles/portfolio-motion.css
git commit -m "Build photography portfolio gallery"
```

---

### Task 4: Category card artwork and real photo import

**Files:**
- Create: `public/media/photography/cards/studio.webp`
- Create: `public/media/photography/cards/wedding.webp`
- Create: `public/media/photography/cards/product.webp`
- Create: `public/media/photography/cards/concert.webp`
- Modify: `src/data/photography.ts`

**Interfaces:**
- Consumes the user-provided source folder path.
- Produces WebP thumbnails and full images referenced by `photographyCategories`.

- [ ] **Step 1: Generate the four cohesive category images**

Use the built-in image generation tool in `stylized-concept` mode with four 4:5 prompts sharing this art direction:

```text
Premium photorealistic editorial still life for Vasiliy Kuznetsov's portfolio category card, dark neutral graphite environment, subtle brushed-metal background, controlled amber key light and cool cyan rim light, cinematic contrast, no people, no readable text, no logos, no watermark, generous negative space, vertical 4:5 composition.
```

Add one exact subject per image: professional studio light and camera for studio; wedding rings, white fabric and bouquet detail for wedding; elegant product on a clean pedestal for product; concert stage lights and crowd silhouettes for concert. Save optimized WebP copies at the four declared paths.

- [ ] **Step 2: Prepare supplied photographs without changing originals**

For each file in the supplied Desktop category folders, create:

```text
public/media/photography/<category>/<sequence>-thumb.webp
public/media/photography/<category>/<sequence>-full.webp
```

Use `ffmpeg` with autorotation and metadata removal. Thumbnail long side: 640 px, WebP quality 78. Full-image long side: 2200 px, WebP quality 84. Preserve aspect ratio and record the actual full-image dimensions and a factual Russian alt description in `src/data/photography.ts`.

- [ ] **Step 3: Verify every manifest path and asset size**

Run a Node script that imports the four collections, resolves each `thumbnail` and `full` under `public/`, and exits nonzero when a file is missing. Confirm no optimized photograph exceeds 500 КБ without manual review.

- [ ] **Step 4: Run full checks and commit assets separately**

Run:

```bash
npm test
npm run build
git diff --check
```

Then add only the generated card art, optimized photo folders, and updated data module:

```bash
git add public/media/photography src/data/photography.ts
git commit -m "Add photography portfolio media"
```
