import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  document.body.innerHTML = '';
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('AI creator page', () => {
  it('renders the two approved modes, an active photo workspace, and truthful empty states', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.stubGlobal('IntersectionObserver', undefined);
    vi.stubGlobal('matchMedia', () => ({ matches: false }));

    await import('../src/pages/ai');

    expect(
      [...document.querySelectorAll<HTMLElement>('[data-ai-mode]')].map((item) => item.getAttribute('aria-label')),
    ).toEqual(['AI-фотосессии', 'Видео и анимация']);
    expect(document.querySelector('[data-ai-panel="photos"]')?.hasAttribute('hidden')).toBe(false);
    expect(document.querySelector('[data-ai-panel="video"]')?.hasAttribute('hidden')).toBe(true);
    expect(document.querySelector('[data-gallery-empty]')?.textContent).toContain(
      'Фотографии этой категории появятся здесь после подготовки материалов.',
    );
    expect(document.querySelector('[data-video-empty]')?.textContent).toContain(
      'AI-видео и анимация появятся здесь после подготовки материалов.',
    );
    expect(document.querySelector<HTMLIFrameElement>('[data-video-frame]')?.getAttribute('src')).toBeNull();
    expect(document.querySelector('.portfolio-cta')?.textContent).toContain(
      'Есть идея, которую невозможно снять обычной камерой?',
    );
    expect(document.querySelector('.portfolio-cta a')?.textContent?.trim()).toBe('Создать AI-проект');
  });

  it('keeps its AI collection empty and makes the interim card path base-aware', async () => {
    const { aiPhotoCollection, aiPhotos } = await import('../src/data/ai');

    expect(aiPhotos).toEqual([]);
    expect(aiPhotoCollection.items).toEqual([]);
    expect(aiPhotoCollection.cardImage).toBe('/vasiliy-kuznetsov-portfolio/media/ai-creator.webp');
  });
});
