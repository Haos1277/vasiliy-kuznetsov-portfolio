import type { GalleryCollection, GalleryItem } from '../lib/gallery-types';
import { withBase } from '../lib/paths';

const aiPhoto = (
  id: string,
  thumbnail: string,
  full: string,
  alt: string,
  width: number,
  height: number,
): GalleryItem => ({
  id,
  thumbnail: withBase(thumbnail),
  full: withBase(full),
  alt,
  width,
  height,
});

export const aiPhotos = [
  aiPhoto("ai-photos-01", "media/ai/photos/thumb/4f5ee08b-gemini.webp", "media/ai/photos/full/4f5ee08b-gemini.webp", "AI-фотосессия, кадр 01", 896, 1200),
  aiPhoto("ai-photos-02", "media/ai/photos/thumb/897ecaef-nano-1k.webp", "media/ai/photos/full/897ecaef-nano-1k.webp", "AI-фотосессия, кадр 02", 896, 1200),
  aiPhoto("ai-photos-03", "media/ai/photos/thumb/8e5df601-6bb0-4c4d-b5b2-a11bd04bc1a1.webp", "media/ai/photos/full/8e5df601-6bb0-4c4d-b5b2-a11bd04bc1a1.webp", "AI-фотосессия, кадр 03", 768, 1344),
  aiPhoto("ai-photos-04", "media/ai/photos/thumb/ed014b4e-nano-1k.webp", "media/ai/photos/full/ed014b4e-nano-1k.webp", "AI-фотосессия, кадр 04", 896, 1200),
  aiPhoto("ai-photos-05", "media/ai/photos/thumb/freepik-facelock-11-use-img1-as-the-face-source-keep-all-f-37231.webp", "media/ai/photos/full/freepik-facelock-11-use-img1-as-the-face-source-keep-all-f-37231.webp", "AI-фотосессия, кадр 05", 1799, 2400),
  aiPhoto("ai-photos-06", "media/ai/photos/thumb/freepik-transform-the-uploaded-photo-of-a-child-into-a-fai-37238.webp", "media/ai/photos/full/freepik-transform-the-uploaded-photo-of-a-child-into-a-fai-37238.webp", "AI-фотосессия, кадр 06", 1799, 2400),
  aiPhoto("ai-photos-07", "media/ai/photos/thumb/freepik-two-stout-men-with-a-full-build-standing-on-a-sand-97386.webp", "media/ai/photos/full/freepik-two-stout-men-with-a-full-build-standing-on-a-sand-97386.webp", "AI-фотосессия, кадр 07", 1340, 2400),
  aiPhoto("ai-photos-08", "media/ai/photos/thumb/freepik-use-the-girls-face-from-the-uploaded-portrait-keep-37228.webp", "media/ai/photos/full/freepik-use-the-girls-face-from-the-uploaded-portrait-keep-37228.webp", "AI-фотосессия, кадр 08", 1799, 2400),
  aiPhoto("ai-photos-09", "media/ai/photos/thumb/image-2026-08-22-20-47-05.webp", "media/ai/photos/full/image-2026-08-22-20-47-05.webp", "AI-фотосессия, кадр 09", 731, 1280),
  aiPhoto("ai-photos-10", "media/ai/photos/thumb/image-2026-08-22-20-47-13.webp", "media/ai/photos/full/image-2026-08-22-20-47-13.webp", "AI-фотосессия, кадр 10", 731, 1280),
  aiPhoto("ai-photos-11", "media/ai/photos/thumb/image-2026-08-22-20-50-48.webp", "media/ai/photos/full/image-2026-08-22-20-50-48.webp", "AI-фотосессия, кадр 11", 731, 1280),
  aiPhoto("ai-photos-12", "media/ai/photos/thumb/image-2026-08-22-21-16-37.webp", "media/ai/photos/full/image-2026-08-22-21-16-37.webp", "AI-фотосессия, кадр 12", 731, 1280),
  aiPhoto("ai-photos-13", "media/ai/photos/thumb/image-2026-08-22-21-16-46.webp", "media/ai/photos/full/image-2026-08-22-21-16-46.webp", "AI-фотосессия, кадр 13", 731, 1280),
  aiPhoto("ai-photos-14", "media/ai/photos/thumb/image-2026-08-22-21-16-57.webp", "media/ai/photos/full/image-2026-08-22-21-16-57.webp", "AI-фотосессия, кадр 14", 1280, 714),
  aiPhoto("ai-photos-15", "media/ai/photos/thumb/image-2026-08-22-21-17-09.webp", "media/ai/photos/full/image-2026-08-22-21-17-09.webp", "AI-фотосессия, кадр 15", 1280, 714),
  aiPhoto("ai-photos-16", "media/ai/photos/thumb/image-2026-08-22-21-17-28.webp", "media/ai/photos/full/image-2026-08-22-21-17-28.webp", "AI-фотосессия, кадр 16", 1280, 714),
  aiPhoto("ai-photos-17", "media/ai/photos/thumb/image-2026-08-22-21-17-57.webp", "media/ai/photos/full/image-2026-08-22-21-17-57.webp", "AI-фотосессия, кадр 17", 1280, 714),
] as const satisfies readonly GalleryItem[];

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
