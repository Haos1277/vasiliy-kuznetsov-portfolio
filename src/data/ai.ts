import type { GalleryCollection, GalleryItem } from '../lib/gallery-types';
import { withBase } from '../lib/paths';

export const aiPhotos: readonly GalleryItem[] = [];

export const aiModeCardImages = {
  photos: withBase('media/ai/cards/photos.webp'),
  video: withBase('media/ai/cards/video.webp'),
} as const;

export const aiPhotoCollection: GalleryCollection<'ai-photos'> = {
  id: 'ai-photos',
  title: 'AI-фотосессии',
  cardImage: withBase('media/ai-creator.webp'),
  items: aiPhotos,
};
