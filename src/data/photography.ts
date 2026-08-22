import type { GalleryCollection, GalleryItem } from '../lib/gallery-types';
import { withBase } from '../lib/paths';

export type PhotoCategoryId = 'studio' | 'wedding' | 'product' | 'concert';

export type PhotoItem = GalleryItem;

export type PhotoCategory = GalleryCollection<PhotoCategoryId>;

export const photographyCategories = [
  {
    id: 'studio',
    title: 'Студийная съёмка',
    cardImage: withBase('media/photography/cards/studio.webp'),
    items: [],
  },
  {
    id: 'wedding',
    title: 'Свадебная съёмка',
    cardImage: withBase('media/photography/cards/wedding.webp'),
    items: [],
  },
  {
    id: 'product',
    title: 'Предметная съёмка',
    cardImage: withBase('media/photography/cards/product.webp'),
    items: [],
  },
  {
    id: 'concert',
    title: 'Концертная съёмка',
    cardImage: withBase('media/photography/cards/concert.webp'),
    items: [],
  },
] as const satisfies readonly PhotoCategory[];
