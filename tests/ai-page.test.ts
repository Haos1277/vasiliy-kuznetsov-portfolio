import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  document.body.innerHTML = '';
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('AI creator page', () => {
  it('renders the two approved modes and both supplied media collections', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('matchMedia', () => ({ matches: false }));

    await import('../src/pages/ai');

    expect(
      [...document.querySelectorAll<HTMLElement>('[data-ai-mode]')].map((item) => item.getAttribute('aria-label')),
    ).toEqual(['AI-фотосессии', 'Видео и анимация']);
    expect(document.querySelector('[data-ai-panel="photos"]')?.hasAttribute('hidden')).toBe(false);
    expect(document.querySelector('[data-ai-panel="video"]')?.hasAttribute('hidden')).toBe(true);
    expect(
      document.querySelector<HTMLImageElement>('[data-ai-mode="photos"] img')?.getAttribute('src'),
    ).toBe('/vasiliy-kuznetsov-portfolio/media/ai/cards/photos.webp');
    expect(
      document.querySelector<HTMLImageElement>('[data-ai-mode="video"] img')?.getAttribute('src'),
    ).toBe('/vasiliy-kuznetsov-portfolio/media/ai/cards/video.webp');
    expect(document.querySelector('[data-gallery-empty]')?.textContent).toContain(
      'Фотографии этой категории появятся здесь после подготовки материалов.',
    );
    expect(document.querySelectorAll('[data-video-work]')).toHaveLength(15);
    expect(document.querySelector<HTMLElement>('[data-video-empty]')?.hidden).toBe(true);
    expect(document.querySelector<HTMLIFrameElement>('[data-video-frame]')?.getAttribute('src')).toBeNull();
    expect(document.querySelectorAll('[data-video-native]')).toHaveLength(1);
    expect(document.querySelector<HTMLVideoElement>('[data-video-native]')?.hidden).toBe(true);
    expect(document.querySelector<HTMLElement>('[data-video-player]')?.hidden).toBe(false);
    expect(document.querySelector('.portfolio-cta')?.textContent).toContain(
      'Есть идея, которую невозможно снять обычной камерой?',
    );
    expect(document.querySelector('.portfolio-cta a')?.textContent?.trim()).toBe('Создать AI-проект');
  });

  it('loads the supplied AI collection and keeps the card path base-aware', async () => {
    const { aiPhotoCollection, aiPhotos } = await import('../src/data/ai');

    expect(aiPhotos).toHaveLength(17);
    expect(aiPhotoCollection.items).toEqual(aiPhotos);
    expect(aiPhotoCollection.cardImage).toBe('/vasiliy-kuznetsov-portfolio/media/ai-creator.webp');
  });
});
