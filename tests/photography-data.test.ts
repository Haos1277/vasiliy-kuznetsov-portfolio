import { describe, expect, it } from 'vitest';
import {
  photographyCategories,
  type PhotoCategory,
} from '../src/data/photography';

describe('photography data', () => {
  it('keeps the four approved collections in order', () => {
    expect(photographyCategories.map(({ id }) => id)).toEqual([
      'studio',
      'wedding',
      'product',
      'concert',
    ]);
  });

  it('uses the approved Russian titles and intentionally empty collections', () => {
    expect(photographyCategories.map(({ title }) => title)).toEqual([
      'Студийная съёмка',
      'Свадебная съёмка',
      'Предметная съёмка',
      'Концертная съёмка',
    ]);
    expect(photographyCategories.every(({ items }) => items.length === 0)).toBe(true);
  });

  it('keeps media paths under the configured base and category folders', () => {
    expect(photographyCategories.map(({ cardImage }) => cardImage)).toEqual([
      '/vasiliy-kuznetsov-portfolio/media/photography/cards/studio.webp',
      '/vasiliy-kuznetsov-portfolio/media/photography/cards/wedding.webp',
      '/vasiliy-kuznetsov-portfolio/media/photography/cards/product.webp',
      '/vasiliy-kuznetsov-portfolio/media/photography/cards/concert.webp',
    ]);

    const categories: readonly PhotoCategory[] = photographyCategories;
    for (const category of categories) {
      for (const item of category.items) {
        expect(item.thumbnail).toContain(`/photography/${category.id}/`);
        expect(item.full).toContain(`/photography/${category.id}/`);
      }
    }
  });
});
