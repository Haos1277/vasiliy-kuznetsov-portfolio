import { describe, expect, it } from 'vitest';

import {
  closeLightbox,
  createGalleryState,
  moveFrame,
  openLightbox,
  selectCategory,
} from '../src/lib/gallery-state';

const categoryIds = ['studio', 'wedding', 'product', 'concert'] as const;

describe('gallery state', () => {
  it('initializes every category at frame zero and rejects an outside initial category', () => {
    const state = createGalleryState(categoryIds, 'wedding');

    expect(state).toEqual({
      activeCategory: 'wedding',
      indexByCategory: {
        studio: 0,
        wedding: 0,
        product: 0,
        concert: 0,
      },
      lightboxOpen: false,
    });

    if (false) {
      // @ts-expect-error The initial category must be one of the supplied IDs.
      createGalleryState(categoryIds, 'portrait');
    }
  });

  it('wraps only inside the active collection without mutating the prior state', () => {
    const state = createGalleryState(categoryIds, 'wedding');
    const nextState = moveFrame(state, -1, 5);

    expect(nextState).not.toBe(state);
    expect(nextState.activeCategory).toBe('wedding');
    expect(nextState.indexByCategory.wedding).toBe(4);
    expect(nextState.indexByCategory.studio).toBe(0);
    expect(state.indexByCategory.wedding).toBe(0);
  });

  it('remembers a separate index for each category', () => {
    let state = createGalleryState(categoryIds, 'studio');
    state = moveFrame(state, 1, 4);
    state = selectCategory(state, 'concert');
    state = moveFrame(state, 1, 3);
    state = selectCategory(state, 'studio');

    expect(state.indexByCategory.studio).toBe(1);
    expect(state.indexByCategory.concert).toBe(1);
  });

  it('does not move an empty collection', () => {
    const state = createGalleryState(categoryIds, 'product');

    expect(moveFrame(state, 1, 0)).toBe(state);
  });

  it('opens and closes the lightbox immutably and closes it on category selection', () => {
    const state = createGalleryState(categoryIds, 'studio');
    const opened = openLightbox(state);
    const selected = selectCategory(opened, 'wedding');
    const closed = closeLightbox(opened);

    expect(opened).toEqual({ ...state, lightboxOpen: true });
    expect(opened).not.toBe(state);
    expect(selected).toEqual({ ...opened, activeCategory: 'wedding', lightboxOpen: false });
    expect(closed).toEqual({ ...opened, lightboxOpen: false });
    expect(state.lightboxOpen).toBe(false);
  });
});
