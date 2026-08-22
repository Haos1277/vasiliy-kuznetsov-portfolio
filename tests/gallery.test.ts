import { afterEach, describe, expect, it, vi } from 'vitest';

import { initGallery } from '../src/lib/gallery';
import type { GalleryCollection } from '../src/lib/gallery-types';

const image = (id: string, alt: string) => ({
  id,
  thumbnail: `data:image/svg+xml,${id}-thumb`,
  full: `data:image/svg+xml,${id}-full`,
  alt,
  width: 1200,
  height: 1500,
});

const fixtureCategories = [
  {
    id: 'studio',
    title: 'Studio',
    cardImage: 'data:image/svg+xml,studio-card',
    items: [image('studio-one', 'Studio one'), image('studio-two', 'Studio two')],
  },
  {
    id: 'wedding',
    title: 'Wedding',
    cardImage: 'data:image/svg+xml,wedding-card',
    items: [image('wedding-one', 'Wedding one'), image('wedding-two', 'Wedding two')],
  },
] as const satisfies readonly [
  GalleryCollection<'studio'>,
  GalleryCollection<'wedding'>,
];

const mountGalleryFixture = (includeItems = true): HTMLElement => {
  document.body.innerHTML = `
    <section data-gallery-root>
      <button type="button" data-gallery-category="studio">Studio</button>
      <button type="button" data-gallery-category="wedding">Wedding</button>
      <button type="button" data-gallery-prev>Previous</button>
      <button type="button" data-gallery-open aria-label="Open image">
        <img data-gallery-image alt="" />
      </button>
      <button type="button" data-gallery-next>Next</button>
      <p data-gallery-count></p>
      <p data-gallery-empty${includeItems ? ' hidden' : ''}>Empty collection</p>
      <div data-lightbox role="dialog" aria-modal="true" aria-hidden="true" hidden>
        <button type="button" data-lightbox-close>Close</button>
        <img data-lightbox-image alt="" />
      </div>
    </section>`;

  return document.querySelector<HTMLElement>('[data-gallery-root]')!;
};

const pointerEvent = (type: string, clientX: number, pointerId: number): PointerEvent => {
  const event = new MouseEvent(type, { bubbles: true, clientX });
  Object.defineProperty(event, 'pointerId', { value: pointerId });
  return event as PointerEvent;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('gallery DOM controller', () => {
  it('renders only the active category and keeps category positions isolated', () => {
    const root = mountGalleryFixture();
    const cleanup = initGallery(root, fixtureCategories);

    root.querySelector<HTMLButtonElement>('[data-gallery-next]')!.click();
    root.querySelector<HTMLButtonElement>('[data-gallery-category="wedding"]')!.click();
    expect(root.querySelector<HTMLImageElement>('[data-gallery-image]')!.alt).toBe('Wedding one');

    root.querySelector<HTMLButtonElement>('[data-gallery-next]')!.click();
    expect(root.querySelector<HTMLImageElement>('[data-gallery-image]')!.alt).toBe('Wedding two');
    expect(root.querySelector('[data-gallery-count]')!.textContent).toBe('02 / 02');

    root.querySelector<HTMLButtonElement>('[data-gallery-category="studio"]')!.click();
    expect(root.querySelector<HTMLImageElement>('[data-gallery-image]')!.alt).toBe('Studio two');
    expect(root.dataset.activeCategory).toBe('studio');
    expect(root.querySelector('[data-gallery-category="studio"]')!.getAttribute('aria-pressed')).toBe('true');
    cleanup();
  });

  it('renders the designed empty state without navigation for an empty collection', () => {
    const root = mountGalleryFixture(false);
    const emptyCategories = [
      { ...fixtureCategories[0], items: [] },
      fixtureCategories[1],
    ] as const;
    const cleanup = initGallery(root, emptyCategories);

    expect(root.querySelector('[data-gallery-empty]')!.hasAttribute('hidden')).toBe(false);
    expect(root.querySelector('[data-gallery-count]')!.textContent).toBe('—');
    expect(root.querySelector<HTMLButtonElement>('[data-gallery-prev]')!.disabled).toBe(true);
    expect(root.querySelector<HTMLButtonElement>('[data-gallery-next]')!.disabled).toBe(true);
    cleanup();
  });

  it('supports keyboard and pointer navigation only after a 48 pixel swipe', () => {
    const root = mountGalleryFixture();
    const cleanup = initGallery(root, fixtureCategories);
    const stage = root.querySelector<HTMLElement>('[data-gallery-open]')!;

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(root.querySelector<HTMLImageElement>('[data-gallery-image]')!.alt).toBe('Studio two');

    stage.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    stage.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 20 }));
    expect(root.querySelector<HTMLImageElement>('[data-gallery-image]')!.alt).toBe('Studio two');

    stage.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 120 }));
    stage.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 70 }));
    expect(root.querySelector<HTMLImageElement>('[data-gallery-image]')!.alt).toBe('Studio one');
    cleanup();
  });

  it('captures an active pointer and releases it after an outside swipe, cancellation, and cleanup', () => {
    const root = mountGalleryFixture();
    const cleanup = initGallery(root, fixtureCategories);
    const stage = root.querySelector<HTMLElement>('[data-gallery-open]')!;
    const capture = vi.fn();
    const release = vi.fn();
    Object.assign(stage, {
      setPointerCapture: capture,
      releasePointerCapture: release,
    });

    stage.dispatchEvent(pointerEvent('pointerdown', 120, 8));
    stage.dispatchEvent(pointerEvent('pointerup', 70, 8));
    expect(capture).toHaveBeenCalledWith(8);
    expect(release).toHaveBeenCalledWith(8);
    expect(root.querySelector<HTMLImageElement>('[data-gallery-image]')!.alt).toBe('Studio two');

    stage.dispatchEvent(pointerEvent('pointerdown', 90, 9));
    stage.dispatchEvent(pointerEvent('pointercancel', 90, 9));
    expect(release).toHaveBeenCalledWith(9);

    cleanup();
    stage.dispatchEvent(pointerEvent('pointerdown', 80, 10));
    expect(capture).toHaveBeenCalledTimes(2);
  });

  it('releases an active pointer during cleanup and ignores later pointer events', () => {
    const root = mountGalleryFixture();
    const cleanup = initGallery(root, fixtureCategories);
    const stage = root.querySelector<HTMLElement>('[data-gallery-open]')!;
    const capture = vi.fn();
    const release = vi.fn();
    Object.assign(stage, {
      setPointerCapture: capture,
      releasePointerCapture: release,
    });

    stage.dispatchEvent(pointerEvent('pointerdown', 120, 24));
    cleanup();
    stage.dispatchEvent(pointerEvent('pointerup', 60, 24));
    stage.dispatchEvent(pointerEvent('pointerdown', 120, 25));

    expect(capture).toHaveBeenCalledWith(24);
    expect(release).toHaveBeenCalledWith(24);
    expect(capture).toHaveBeenCalledTimes(1);
  });

  it('opens an accessible lightbox, returns focus on Escape, and removes listeners on cleanup', () => {
    const root = mountGalleryFixture();
    const cleanup = initGallery(root, fixtureCategories);
    const open = root.querySelector<HTMLButtonElement>('[data-gallery-open]')!;
    open.focus();
    open.click();

    const lightbox = root.querySelector<HTMLElement>('[data-lightbox]')!;
    expect(lightbox.getAttribute('aria-hidden')).toBe('false');
    expect(lightbox.hidden).toBe(false);
    expect(document.activeElement).toBe(root.querySelector('[data-lightbox-close]'));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(lightbox.getAttribute('aria-hidden')).toBe('true');
    expect(document.activeElement).toBe(open);

    cleanup();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(root.querySelector<HTMLImageElement>('[data-gallery-image]')!.alt).toBe('Studio one');
  });

  it('preloads only the adjacent full-size images for the active collection', () => {
    const root = mountGalleryFixture();
    const setSource = vi.fn();
    const originalImage = globalThis.Image;
    class PreloadImage {
      set src(value: string) {
        setSource(value);
      }
    }
    globalThis.Image = PreloadImage as unknown as typeof Image;

    const cleanup = initGallery(root, fixtureCategories);

    expect(setSource).toHaveBeenCalledTimes(1);
    expect(setSource).toHaveBeenCalledWith('data:image/svg+xml,studio-two-full');
    expect(setSource).not.toHaveBeenCalledWith('data:image/svg+xml,wedding-one-full');

    cleanup();
    globalThis.Image = originalImage;
  });
});
